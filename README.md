# SnipSnap

SnipSnap is a full-stack blogging platform where users can publish posts, explore content by genre or author, and engage through likes and comments. It is built with Node.js, Express, MongoDB, and EJS, with a responsive UI for desktop and mobile.

## Live Demo

https://snipsnap-tyfs.onrender.com/

## Features

- User authentication with JWT-based session cookie
- Sign up, sign in, logout, and account deletion
- Create, edit, and delete your own blog posts
- Upload blog cover images with Cloudinary
- Like and unlike blog posts
- Comment on blogs and like/unlike comments
- Filter blogs on home page by:
  - Genre
  - Author
  - Sort order (newest or oldest)
- User profile page with personal posts
- Static pages: FAQ, Contact, About, Team, Privacy, Terms
- Contact form message storage
- Security middleware:
  - Helmet
  - Express Mongo Sanitize

## Tech Stack

Frontend
- EJS templates
- HTML5
- CSS3
- Vanilla JavaScript
- Bootstrap assets

Backend
- Node.js
- Express.js
- MongoDB + Mongoose

Services and Libraries
- Cloudinary + Multer storage for image uploads
- SendGrid for email utility
- bcrypt for password hashing
- jsonwebtoken for auth token creation/verification
- cookie-parser and method-override

## Project Structure

- index.js
- routes/
  - user.js
  - blog.js
  - static.js
- models/
  - user.js
  - blog.js
  - comment.js
  - message.js
- middlewares/
  - authentication.js
- services/
  - authentication.js
  - sendMail.js
- views/
- public/

## Environment Variables

Create a .env file in the project root and add:

PORT=9000
SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_connection_string

SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_SENDER=your_verified_sender_email

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

## Getting Started

1. Clone the repository
   git clone https://github.com/amanshow24/snipsnap.git

2. Move into the project folder
   cd snipsnap

3. Install dependencies
   npm install

4. Add your environment variables in .env

5. Start the app
   npm start

For development with auto-restart:

npm run dev

App runs at:

http://localhost:9000

## Home Page Filters

The home page supports query-based filtering:

- genre: filter posts by genre
- author: filter posts by author id
- sort: newest (default) or oldest

Example pattern:

/?genre=Technology&sort=oldest

## Authentication Notes

- Auth token is stored in a cookie named token.
- Current flow supports direct sign up and direct password reset.
- OTP-based signup and password reset routes are present in comments for possible future use.

## Scripts

- npm start: run production server
- npm run dev: run with nodemon

## Deployment

The app is currently deployed on Render. For deployment:

- Set all required environment variables in your hosting provider
- Ensure MongoDB Atlas network access is configured
- Ensure SendGrid sender identity is verified
- Ensure Cloudinary credentials are valid

## Contributing

1. Fork this repository
2. Create a feature branch
3. Commit your changes
4. Push your branch
5. Open a pull request

## License

This project is currently marked as ISC in package.json.

## Author

Aman Show
https://github.com/amanshow24
