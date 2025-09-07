# 📝 Blogify — Content Sharing Platform  

A full-stack **content-sharing platform** built with **EJS, Node.js, Express.js, MongoDB, Multer, and Cloudinary**.  
It allows users to **create, publish, edit, and comment** on blogs while ensuring **secure access**, **optimized images**, and **fast performance**.

---

## 🚀 Features

### **User Features**
- User **registration and login** with **OTP verification**.
- **Create, edit, publish, and delete** blogs easily.
- Interactive **commenting system** to engage with other users.
- **Optimized page load speed** using **WebP image conversion**.
- **Profile management** with images stored on **Cloudinary**.

### **Security**
- **Protected routes** using **dynamic parameters** to prevent bypassing verification.
- **OTP-based authentication** for secure user onboarding.
- Secure **file uploads** handled with **Multer** and stored via **Cloudinary**.

---

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, EJS  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Authentication:** OTP + JWT  
- **Image Handling:** Multer + WebP + Cloudinary  

---

## 📦 Installation & Setup

```bash
# Clone the repository
git clone https://github.com/your-username/blogify.git

# Navigate to the project folder
cd blogify

# Install dependencies
npm install

# Add your environment variables in .env file
# Example:
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Start the server
npm start
