import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../libs/db';
import { uploadToS3, deleteFromS3, generateImageKey } from '../../../../libs/s3';

// POST - Upload images for a property
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = parseInt(params.id);

    // Check if property exists and get owner_id
    const propertyCheck = await pool.query(
      'SELECT owner_id, image_urls FROM properties WHERE id = $1',
      [propertyId]
    );

    if (propertyCheck.rowCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Property not found'
      }, { status: 404 });
    }

    const { owner_id: ownerId, image_urls: currentImages } = propertyCheck.rows[0];
    const currentImageCount = currentImages ? currentImages.length : 0;

    // Get form data
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No images provided'
      }, { status: 400 });
    }

    // Check if total images would exceed 4
    if (currentImageCount + files.length > 4) {
      return NextResponse.json({
        success: false,
        error: `Cannot upload ${files.length} images. Maximum 4 images allowed per property. Current: ${currentImageCount}`
      }, { status: 400 });
    }

    // Validate file types and sizes
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({
          success: false,
          error: `Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}`
        }, { status: 400 });
      }

      if (file.size > maxFileSize) {
        return NextResponse.json({
          success: false,
          error: `File too large: ${file.name}. Maximum size: 5MB`
        }, { status: 400 });
      }
    }

    // Upload files to S3
    const uploadedUrls: string[] = [];
    const uploadPromises = files.map(async (file, index) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const imageIndex = currentImageCount + index + 1;
      const key = generateImageKey(ownerId, propertyId, imageIndex);

      const url = await uploadToS3(buffer, key, file.type);
      return url;
    });

    try {
      const newUrls = await Promise.all(uploadPromises);
      uploadedUrls.push(...newUrls);
    } catch (uploadError) {
      console.error('Error uploading to S3:', uploadError);
      return NextResponse.json({
        success: false,
        error: 'Failed to upload images to S3'
      }, { status: 500 });
    }

    // Update database with new image URLs
    const updatedImageUrls = [...currentImages, ...uploadedUrls];

    const updateQuery = `
      UPDATE properties
      SET image_urls = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [updatedImageUrls, propertyId]);

    return NextResponse.json({
      success: true,
      data: {
        property: result.rows[0],
        uploaded_images: uploadedUrls,
        total_images: updatedImageUrls.length
      },
      message: `Successfully uploaded ${uploadedUrls.length} image(s)`
    }, { status: 201 });

  } catch (error) {
    console.error('Error uploading property images:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to upload property images'
    }, { status: 500 });
  }
}

// DELETE - Delete specific images from a property
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = parseInt(params.id);
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json({
        success: false,
        error: 'Image URL parameter is required'
      }, { status: 400 });
    }

    // Check if property exists and get current images
    const propertyCheck = await pool.query(
      'SELECT owner_id, image_urls FROM properties WHERE id = $1',
      [propertyId]
    );

    if (propertyCheck.rowCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Property not found'
      }, { status: 404 });
    }

    const { owner_id: ownerId, image_urls: currentImages } = propertyCheck.rows[0];

    if (!currentImages || !currentImages.includes(imageUrl)) {
      return NextResponse.json({
        success: false,
        error: 'Image not found for this property'
      }, { status: 404 });
    }

    // Extract S3 key from URL
    const urlParts = imageUrl.split('/');
    const key = urlParts.slice(-3).join('/'); // userid/propertyid/filename.jpg

    try {
      // Delete from S3
      await deleteFromS3(key);
    } catch (s3Error) {
      console.error('Error deleting from S3:', s3Error);
      // Continue with database update even if S3 deletion fails
    }

    // Remove URL from database
    const updatedImageUrls = currentImages.filter((url: string) => url !== imageUrl);

    const updateQuery = `
      UPDATE properties
      SET image_urls = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [updatedImageUrls, propertyId]);

    return NextResponse.json({
      success: true,
      data: {
        property: result.rows[0],
        deleted_image: imageUrl,
        remaining_images: updatedImageUrls.length
      },
      message: 'Image deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting property image:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete property image'
    }, { status: 500 });
  }
}