
# 📝 SnipSnap

SnipSnap is a dynamic, full-featured blogging platform that enables users to create, read, and interact with blog posts. With user authentication, responsive design, and clean UI, it’s built to be fast, extensible, and beginner-friendly.

---

## 📸 Live Demo 

<!-- 🔗 [Live Demo](https://snipsnap-1xvw.onrender.com) -->

---

## ✨ Features

- 📝 Create and publish blog posts
- 🔐 User authentication with secure password handling
- 💬 Comment system for posts
- ❤️ Like system for blogs and comments
- 📧 Email-based OTP verification for signup and password reset
- 📱 Fully responsive UI with mobile-first CSS
- 🧰 Admin/user-based controls and alert messages
- 📬 Contact form, FAQ, About Us, Team, Terms & Privacy pages

---

## 🛠️ Tech Stack

**Frontend:**
- HTML5, CSS3 (Responsive)
- JavaScript
- EJS (Embedded JavaScript templating)

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose

**Email Service:**
- SendGrid API

**Authentication:**
- Custom middleware
- OTP-based verification
- JWT (planned or implied from structure)

---

## 🚀 Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/amanshow24/snipsnap.git
cd snipsnap
npm install
```

Create a `.env` file in the root directory with the following values:

```env
MONGODB_URI=your_mongodb_connection_string
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=your_verified_sender_email
SESSION_SECRET=your_secret_key
```

Then start the development server:

```bash
npm start
```

App should be live at `http://localhost:3000`.

---

## ▶️ Usage

1. Sign up using your email and OTP verification.
2. Create new blog posts from the dashboard.
3. Like and comment on posts.
4. Explore other pages like FAQ, Contact, and Team.
5. Reset your password via email OTP if needed.

---

## 🤝 Contributing

We welcome contributions from the community!

1. Fork the repository.
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request.

Please follow existing code style and naming conventions.

---

## 📄 License

<!-- You can change this once you choose a license -->
Licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [SendGrid](https://sendgrid.com/)
- [Bootstrap (optional)](https://getbootstrap.com/)
- All open-source contributors and testers!

---

> Created with ❤️ by [Aman Show](https://github.com/amanshow24)
