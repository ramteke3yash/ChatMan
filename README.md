# Chatman - A Group Chat Application

Welcome to Chatman, a group chat application that allows users to create accounts, form groups, and engage in real-time chats with other members of the group. The project is built using ExpressJS with MySQL (Sequelize) for data storage, and HTML/JS/Tailwind for the frontend. Image storage for chat support is provided by Amazon S3



## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Installation and Usage](#installation-and-usage)
- [Technologies Used](#technologies-used)

- [Support and Feedback](#support-and-feedback)



## Introduction

Chatman is a user-friendly group chat application that aims to provide seamless communication within groups. Users can sign up, create and manage groups, invite members, and chat with each other, sharing images and messages effortlessly.

## Features

- **Signup and Login**: Users can create accounts and log in to access their group chats.

- **Group Management**: Users can create new groups and delete existing groups as needed.

- **Group Administration**: Group admins have the authority to manage group members and settings.

- **Group Members**: Users can view all registered users and current members within a group.

- **Real-time Chat**: Engage in real-time conversations with other members of the group.

- **Image Support**: Chat messages support image insertion for easy sharing of visual content.


## Tech Stack

**Client:** HTML, TailwindCSS, JavaScript

**Server:** Node, Express, AWS S3, MySQL, Socket.io
## Screenshots


![chatMan4](https://github.com/ramteke3yash/ChatMan/assets/111893510/f4942fe5-5713-4121-a3de-9bc1ddca5354)

![chatMan3](https://github.com/ramteke3yash/ChatMan/assets/111893510/f3944578-9a7f-4f7a-8150-3f03b939751f)

![chatMan2](https://github.com/ramteke3yash/ChatMan/assets/111893510/1814613a-ebd3-4c91-b195-8df094f2f0a5)


## Technologies Used

The following technologies were used in building the Chatman application:

- ExpressJS: A fast and minimalist web framework for Node.js, used for handling server-side requests and routing.
- MySQL (Sequelize): A relational database management system, used for data storage and retrieval.

- Socket.io: A library that enables real-time, bidirectional, and event-based communication between web clients and servers. It's used for implementing real-time chat functionality in the Chatman application.
- HTML/JS/Tailwind: The standard markup and scripting languages for creating web pages and user interfaces, styled with Tailwind CSS.
- AWS S3: Amazon Simple Storage Service (S3) is used for storing and serving images in chat messages. It provides scalable, secure, and reliable storage for your application's image assets.
## Installation and Usage

1. Clone this repository.
2. Install the necessary dependencies: `npm install`.
3. Set up your MySQL database and configure the connection in `db.js`.
4. Set up required environment variables for AWS S3.
5. Run the application: `npm start`.
6. Access Chatman in your web browser at `http://localhost:3000`.

## Support and Feedback

If you encounter any issues while using Chatman or have suggestions for improvement, please feel free to open an issue on the GitHub repository. We appreciate your feedback and are here to assist you.
