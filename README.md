<p align="center">
  <img src="src/assets/logo.png" width="100" />
</p>
<p align="center">
    <h1 align="center"></h1>
</p>
<p align="center">
    <em>NETVISR SSH MONITOR</em>
</p>
<p align="center">
	<img src="https://img.shields.io/github/license/Joansitoh/ssh_monitor?style=flat&color=0080ff" alt="license">
	<img src="https://img.shields.io/github/last-commit/Joansitoh/ssh_monitor?style=flat&logo=git&logoColor=white&color=0080ff" alt="last-commit">
	<img src="https://img.shields.io/github/languages/top/Joansitoh/ssh_monitor?style=flat&color=0080ff" alt="repo-top-language">
	<img src="https://img.shields.io/github/languages/count/Joansitoh/ssh_monitor?style=flat&color=0080ff" alt="repo-language-count">
<p>
<p align="center">
<em>NETVISR SSH MONITOR is a React application that allows you to monitor SSH connections on machines. The application features a simple and user-friendly graphical interface.</em>
</p>
<p align="center">
	<img src="https://img.shields.io/badge/Prettier-F7B93E.svg?style=flat&logo=Prettier&logoColor=black" alt="Prettier">
	<img src="https://img.shields.io/badge/HTML5-E34F26.svg?style=flat&logo=HTML5&logoColor=white" alt="HTML5">
	<img src="https://img.shields.io/badge/YAML-CB171E.svg?style=flat&logo=YAML&logoColor=white" alt="YAML">
	<br>
	<img src="https://img.shields.io/badge/Vite-646CFF.svg?style=flat&logo=Vite&logoColor=white" alt="Vite">
	<img src="https://img.shields.io/badge/React-61DAFB.svg?style=flat&logo=React&logoColor=black" alt="React">
	<img src="https://img.shields.io/badge/ESLint-4B32C3.svg?style=flat&logo=ESLint&logoColor=white" alt="ESLint">
	<img src="https://img.shields.io/badge/JSON-000000.svg?style=flat&logo=JSON&logoColor=white" alt="JSON">
</p>
<hr>

## 🔗 Quick Links

> - [📍 Overview](#-overview)
> - [📦 Features](#-features)
> - [🚀 Getting Started](#-getting-started)
>   - [⚙️ Installation](#️-installation)
>   - [🤖 Running ](#-running-)
> - [🤝 Contributing](#-contributing)
> - [📄 License](#-license)

---

## 📍 Overview

![SSH Monitor screenshot 1](/resources/ssh_panel_one.png)
![SSH Monitor screenshot 2](/resources/ssh_panel_two.png)

<details>
  <summary>SSH Monitor Screenshots</summary>

![SSH Monitor screenshot 3](/resources/ssh_attempts_bars.png)
![SSH Monitor screenshot 3](/resources/ssh_attempts_map.png)
![SSH Monitor screenshot 3](/resources/ssh_attempts_names.png)

## </details>

## 📦 Features

<code>► Geo-location of IP addresses</code>
<code>► User-friendly interface</code>
<code>► Real-time monitoring of SSH connections</code>
<code>► Count of ssh connections</code>

---

## 🚀 Getting Started

**_Requirements_**

Ensure you have the following dependencies installed on your system:

- **Node.js**: `version 20.0.0`
- **rsyslog**: `version 8.2108.0`

### ⚙️ Installation

1. Clone the repository:

```sh
git clone https://github.com/Joansitoh/ssh_monitor/
```

2. Change to the project directory:

```sh
cd ssh_monitor
```

3. Install the dependencies:

```sh
npm install
```

### 🤖 Running

#### Development Mode

If you want to run the application in development mode, you can use the following command:

```sh
npm run test
```

#### Production Mode

Running the application in production mode involves several steps:

1. Build the application:

```sh
npm run build
```

2. Copy the build output to the web server directory. This example uses Apache, so the target directory is `/var/www/html`. Adjust this command if you're using a different web server like Nginx:

```sh
cp -r dist/* /var/www/html/
```

3. Run the API server:

```sh
npm run api
```

Note: You need a web server like Apache2 or Nginx to serve the static files in production mode.

## 🤝 Contributing

Contributions are welcome! Here are several ways you can contribute:

- **[Submit Pull Requests](https://github.com/Joansitoh/ssh_monitor/blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.
- **[Join the Discussions](https://github.com/Joansitoh/ssh_monitor/discussions)**: Share your insights, provide feedback, or ask questions.
- **[Report Issues](https://github.com/Joansitoh/ssh_monitor/issues)**: Submit bugs found or log feature requests for .

<details closed>
    <summary>Contributing Guidelines</summary>

1. **Fork the Repository**: Start by forking the project repository to your GitHub account.
2. **Clone Locally**: Clone the forked repository to your local machine using a Git client.
   ```sh
   git clone https://github.com/Joansitoh/ssh_monitor/
   ```
3. **Create a New Branch**: Always work on a new branch, giving it a descriptive name.
   ```sh
   git checkout -b new-feature-x
   ```
4. **Make Your Changes**: Develop and test your changes locally.
5. **Commit Your Changes**: Commit with a clear message describing your updates.
   ```sh
   git commit -m 'Implemented new feature x.'
   ```
6. **Push to GitHub**: Push the changes to your forked repository.
   ```sh
   git push origin new-feature-x
   ```
7. **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.

Once your PR is reviewed and approved, it will be merged into the main branch.

</details>

---

## 📄 License

This project is protected under the [MIT](https://choosealicense.com/licenses/mit/) License. For more details, refer to the [LICENSE](https://choosealicense.com/licenses/mit/) file.

[**Return**](#-quick-links)

---
