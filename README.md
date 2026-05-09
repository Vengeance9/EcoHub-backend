# EcoHub-Backend

## Project Description
EcoHub is a community portal backend API that enables members to share sustainability ideas, vote on solutions, and collaborate on environmental projects. Admins can moderate content, manage users, and provide feedback on submissions.

## Live URLs
- Backend API: `https://ecohub-backend-jkya.onrender.com`
- Frontend: `https://ecohub-frontend.vercel.app/`

## Features

### User Features
- User registration & login with JWT authentication
- Create, edit, and delete sustainability ideas
- Upvote/downvote system (Reddit-like)
- Comment on ideas with replies
- Purchase access to paid ideas

### Admin Features
- Approve/reject ideas with feedback
- Activate/deactivate user accounts
- Edit user roles (Member/Admin)
- Highlight/feature ideas
- Create categories

### Core Functionality
- Category system (Energy, Waste, Transportation)
- Search & filter ideas by category, status, and votes
- Payment integration for premium ideas
- Newsletter subscription management

## Technologies Used

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express.js | Backend framework |
| TypeScript | Type safety |
| PostgreSQL | Database |
| Prisma | ORM |
| JWT | Authentication |
| Stripe | Payment gateway |
| Cloudinary | Image upload |
| Multer | File handling |

