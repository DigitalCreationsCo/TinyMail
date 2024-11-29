<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/DigitalCreationsCo/TinyMail/blob/main/public/logo-square.png">
  <source media="(prefers-color-scheme: light)" srcset="https://github.com/DigitalCreationsCo/TinyMail/blob/main/public/logo-square.png">
  <img alt="Tiny Mail Logo" src="https://github.com/DigitalCreationsCo/TinyMail/blob/main/public/logo-square.png" height="200" width="200">
</picture>

# Tiny Mail

**Tiny Mail** is a powerful application designed to streamline email creation and customization using prewritten templates. With integrations for Google Sheets and OAuth2-powered authentication, Tiny Mail enables users to automate their email workflows efficiently. Whether you're managing newsletters, email series, or one-off communications, Tiny Mail provides the tools you need for hassle-free email management.

## Features

### 1. **Automated Email Creation**
- Create emails automatically using prewritten templates tailored to various purposes.

### 2. **Scheduled Email Publishing**
- Plan and schedule your email campaigns to go out at the right time with ease.

### 3. **Email Series Creation**
- Combine content from separate sources to build cohesive email series.

### 4. **Custom Email Editor**
- Use the full-featured editor to craft personalized emails that match your brand and message.

### 5. **Newsletter Management**
- Design, create, and send engaging email newsletters to your audience.

### 6. **Google Sheets Integration**
- Seamlessly pull data from Google Sheets for dynamic content population in emails.
- OAuth2 authentication ensures secure access to user profiles and data sources.

## How It Works

1. **User Authentication**
   - Authenticate your profile using OAuth2 for secure integration with Google Sheets and other data sources.

2. **Template Selection**
   - Choose from a library of prewritten email templates designed for different use cases.

3. **Customization**
   - Use the built-in editor to modify templates or create emails from scratch.

4. **Integration**
   - Pull dynamic data from Google Sheets to personalize email content.

5. **Publishing**
   - Schedule your emails or send them instantly to your recipients.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/tiny-mail.git
   cd tiny-mail

2. Install dependencies:
   ```bash
   npm install

4. Set up environment variables: Create a .env file in the project root with the following:
   ```env
   PORT=3000
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   SESSION_SECRET=your-session-secret

4. Start the application:
   ```bash
   npm start

## Configuration
Google OAuth2:

Obtain your Google Client ID and Client Secret from the Google Cloud Console.
Configure the app's OAuth2 consent screen and authorized redirect URIs.

##Environment Variables:
PORT: Port number for the application (default: 3000).
GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET: Credentials for Google Sheets integration.
SESSION_SECRET: Secret key for session management.

## Usage
Log In
Sign in using your Google account to authenticate and gain access to your data sources.

Select a Template
Browse the template library and choose one that fits your needs.

Customize Content
Modify the template using the editor or integrate dynamic data from Google Sheets.

Schedule or Send Emails
Choose to send emails immediately or schedule them for later delivery.

## Roadmap
Possible features include:

Integration with other data sources (e.g., Airtable, Notion).
Advanced analytics for email performance tracking.
Support for multiple email providers.

## Contributing
Contributions are welcome! If you'd like to contribute, please:

Fork this repository.
Create a feature branch (git checkout -b feature/your-feature).
Commit your changes (git commit -m "Add your feature").
Push to the branch (git push origin feature/your-feature).
Open a pull request.

## License
This project is licensed under the MIT License.

Tiny Mail simplifies email creation and customization, making it a powerful tool for businesses and individuals. Start automating your email workflows today!

This README is designed to clearly describe **Tiny Mail**, its features, and how to use and contribute to the application. Let me know if you'd like to add more technical details or further refine it!
