# Product Reviews & Ratings Feature

## Overview
This feature allows users to rate products (1-5 stars) and leave comments/reviews. Reviews are displayed in the product details modal when viewing a product.

## Installation Steps

### 1. Database Setup
Run the SQL migration to create the product reviews table:

```bash
# Navigate to phpMyAdmin or MySQL command line
# Execute the SQL file:
database/create_product_reviews_table.sql
```

Or run this SQL directly:

```sql
CREATE TABLE IF NOT EXISTS product_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product_review (product_id, user_id),
    INDEX idx_product_id (product_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Files Created/Modified

**New Files:**
- `database/create_product_reviews_table.sql` - Database table creation script
- `api/product-reviews.php` - API endpoint for reviews (GET and POST)
- `PRODUCT_REVIEWS_SETUP.md` - This documentation file

**Modified Files:**
- `products.html` - Added reviews section to product details modal
- `js/products.js` - Added review loading, display, and submission functionality

## Features

### User Features
- **View Reviews**: All users can see product reviews and ratings in the product details modal
- **Rate Products**: Logged-in users (non-admin) can rate products from 1-5 stars
- **Leave Comments**: Users can optionally add text comments along with their rating
- **Edit Reviews**: Users can update their existing review for a product
- **Average Rating Display**: Shows calculated average rating and total review count

### Admin Features
- Admins cannot submit reviews (this prevents admin manipulation of ratings)

### Review Display
- Reviews are sorted by most recent first
- Each review shows:
  - User's name (or username if name not available)
  - Star rating (1-5)
  - Comment (if provided)
  - Date posted
- Average rating is calculated and displayed at the top of the reviews section

## API Endpoints

### GET `/api/product-reviews.php?product_id={id}`
Retrieves all reviews for a specific product.

**Response:**
```json
{
  "success": true,
  "reviews": [
    {
      "id": 1,
      "product_id": 1,
      "user_id": 5,
      "rating": 5,
      "comment": "Great product!",
      "created_at": "2024-01-15 10:30:00",
      "username": "johndoe",
      "first_name": "John",
      "last_name": "Doe"
    }
  ],
  "average_rating": 4.5,
  "review_count": 10
}
```

### POST `/api/product-reviews.php`
Submit a new review or update an existing one.

**Request Body:**
```json
{
  "product_id": 1,
  "rating": 5,
  "comment": "Excellent product!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review submitted successfully"
}
```

**Authentication Required:** Yes (user must be logged in)

## Security Features

1. **Authentication Required**: Only logged-in users can submit reviews
2. **One Review Per User**: Each user can only submit one review per product (updated if they submit again)
3. **XSS Protection**: Comments are escaped using `escapeHtml()` function
4. **Input Validation**: Ratings must be between 1-5, product must exist
5. **Admin Protection**: Admin users cannot submit reviews

## Usage

### For Users:
1. Navigate to the Products page
2. Click "View" on any product
3. Scroll down to the "Reviews & Ratings" section
4. If logged in, you'll see a review form:
   - Click stars to select rating (1-5)
   - Optionally add a comment
   - Click "Submit Review"
5. If not logged in, you'll see a prompt to log in

### For Developers:
The review system is automatically integrated into the product details modal. When `viewProductDetails(productId)` is called:
- Reviews are automatically loaded
- Review form is initialized based on user login status
- Reviews are displayed with calculated average rating

## Future Enhancements (Optional)

- Allow users to edit/delete their own reviews
- Add review moderation (approve before publishing)
- Add helpful/not helpful votes on reviews
- Display reviews on product cards (with average rating)
- Add image uploads to reviews
- Add verified purchase badges
- Filter reviews by rating (1 star, 2 stars, etc.)

## Troubleshooting

### Reviews not loading?
- Check browser console for JavaScript errors
- Verify the database table was created correctly
- Check API endpoint is accessible: `api/product-reviews.php?product_id=1`
- Verify database connection in `config/database.php`

### Cannot submit review?
- Ensure you're logged in (check `api/auth.php?action=check`)
- Verify you're not logged in as admin (admins cannot review)
- Check browser console for error messages
- Verify the API endpoint accepts POST requests

### Duplicate reviews?
- Each user can only have one review per product
- Submitting again will update the existing review
- The unique constraint `unique_user_product_review` prevents duplicates

## Testing

1. **Test as Logged-in User:**
   - Open product details
   - Submit a review with rating and comment
   - Verify review appears in the list
   - Submit another review (should update existing)

2. **Test as Guest:**
   - Open product details
   - Verify login prompt appears
   - Click login button (should redirect to auth page)

3. **Test as Admin:**
   - Log in as admin
   - Open product details
   - Verify review form is hidden (admins cannot review)
