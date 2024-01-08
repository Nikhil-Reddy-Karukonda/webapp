## Network structures and cloud computing (CSYE 6225) 

## Assignments Tracker - Cloud Native Web Application

![AWS](https://img.shields.io/badge/AWS-Cloud%20Computing-orange) ![Node.js](https://img.shields.io/badge/Node.js-Backend-blue) ![Pulumi](https://img.shields.io/badge/IAC-Pulumi-green) ![CI/CD](https://img.shields.io/badge/GitHub%20Actions-CI%2FCD-yellowgreen) ![Serverless](https://img.shields.io/badge/Serverless-Architecture-blue)

## Overview
The Assignments Tracker is an application designed for streamlined assignment submissions. It emphasizes a secure, reliable, scalable, and highly available architecture on AWS, offering optimal performance for educational institutions and learners.

### Repositories
- Web Application: [GitHub - Webapp](https://github.com/Nikhil-Reddy-Karukonda/webapp)
- IAC Pulumi: [GitHub - IAC Pulumi](https://github.com/Nikhil-Reddy-Karukonda/iac-pulumi)
- Serverless: [GitHub - Serverless](https://github.com/Nikhil-Reddy-Karukonda/serverless-fork)
  
<img src="project.png" alt="Assignment Tracker" height="500" width="500"/>

## Project Setup

### Prerequisites
Before building and deploying the application, ensure you have the following prerequisites:

- AWS Account and CLI setup, Debian 12 OS
- Node.js and npm installed
- PostgreSQL installed

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Nikhil-Reddy-Karukonda/webapp
   cd webapp
   ```

## Environment Configuration 🌐

Create a `.env` file in your project directory and configure the following parameters:

```env
DB_USERNAME=<your_database_username>
DB_PASSWORD=<your_database_password>
DB_HOST=<your_database_host>
DB_DIALECT=<your_database_dialect>
DB_PORT=<your_database_port>
DB_NAME=<your_database_name>
PORT=<application_port>
ENV_TYPE='DEBIAN_VM' # Or 'GITHUB_CI' Or 'pulumi'
ASG_LAUNCH_CONFIG=<your_asg_launch_config>
ASG_NAME=<your_asg_name>
AWS_ACCESS_KEY_ID=<your_aws_access_key_id_dev>
AWS_SECRET_ACCESS_KEY=<your_aws_secret_access_key_dev>
AWS_ACCESS_KEY_ID_DEMO=<your_aws_access_key_id_demo>
AWS_SECRET_ACCESS_KEY_DEMO=<your_aws_secret_access_key_demo>

Install Dependencies 🔧
`npm install`

Start the Application  🚀
`npm start`

Running Tests 🧪
`npx mocha tests/*.test.js`

```
In the `ami.pkr.hcl` file, the following default values are set for key variables:
**source_ami** - "debian_12_ami_id"
**subnet_id** - "subnet_id_default_vpc"
**ami_region_list** - ["us-east-1"]
**ami_users_list** - ["dev_aws_account_id","demo_aws_account_id"]

### Features
- :cloud: **Cloud-Native NodeJS Backend**: Secure, efficient handling of requests, Infrastructure as Code (IaC) using Pulumi, Serverless architecture for efficient resource management
- :lock: **Enhanced Security**: Configured Security Groups for Load Balancer, EC2, and RDS with SSL/TLS encryption via AWS Certificate Manager, passwords are hashed using BCrypt algorithm
- :globe_with_meridians: **DNS Management**: Streamlined web app access with Route53 for DNS setup, including A, NS, and TXT records.
- :repeat: **High Availability**: Deployed across multiple Availability Zones (AZs) using Pulumi IAC, ensuring 99.99% uptime.
- :chart_with_upwards_trend: **Auto-Scaling**: Dynamic resource management with auto-scaling groups and CloudWatch CPU utilization alarms.
- :hammer_and_wrench: **CI/CD Workflow**: EC2 Automation with GitHub Actions & HashiCorp Packer, **Integration**: GitHub Actions with HashiCorp Packer for custom AMIs, **Automation**: EC2 app auto-startup via systemD; configures web apps, DB servers, autorun in `/etc/systemd/system`, **Scaling**: Consistent Auto Scaling Group refreshes with updated AMIs.
- :file_folder: **Reliable File Delivery System**: Reliable file delivery system for assignment submissions, automating GitHub release downloads to S3 via Lambda and SNS triggers, with streamlined user notifications and DynamoDB for enhanced tracking and auditability

# Database Bootstrapping 🛠️🗃️

This section outlines the process for automatic database bootstrapping at application startup.

## Overview 📄

- **Bootstrapping Process** 🚀: Automatically creates or updates the schema, tables, indexes, sequences, etc., based on the latest definitions.
- **No Manual Setup** ❌📝: Avoid manual database setup using SQL scripts.

## Recommended ORM Framework 🔄
- **Node.js Applications** 🟢: Use [Sequelize](https://sequelize.org/).

## Steps 🚶‍♂️

1. **Integrate ORM Framework** ⚙️:
   - For Node.js, install Sequelize using `npm install sequelize`.

2. **Configure ORM** 🔧:
   - Set up the ORM to connect to your database 🌐.
   - Configure entity mappings to reflect your database schema 📐.

3. **Enable Auto Bootstrapping** 🤖:
   - In Sequelize, use the `sync()` method 🔄.

4. **Start Your Application** 🚀:
   - Run your application. The ORM framework will handle the bootstrapping automatically.

## Note 📝
- Ensure your database user has sufficient privileges for schema modification 🔑.

## Conclusion 🎉
By following these steps, your application will automatically bootstrap the database at startup, ensuring that your database schema is always in sync with your application model.

# CI/CD for Web Application 🚀 using GitHub Actions.

## Pull Request Raised Workflow 🔄

1. **GitHub Action - Integration Tests** ✅: Automatically run Integration tests for each pull request.
2. **Merge Condition** 🚧: Pull requests can be merged only if all tests pass successfully.

## Pull Request Merged Workflow 🛠️

Triggered upon merging a pull request:

1. **Run Integration Tests** ✅: Validate code through integration testing to ensure system integrity.
2. **Validate Packer Template** 📜: Confirm Packer configurations are correct.
3. **Build Application Artifacts** 🏗️: Compile and package the application.
4. **Build AMI** 🖥️:
   - Upgrade OS packages 🔄.
   - Install dependencies (e.g., Python, Node.js) 📦.
   - Install application dependencies (`pip install` for Python) 🐍.
   - Copy application artifacts and configuration files 🔧.
   - Configure application auto-start on VM launch 🌟.
5. **Update Launch Template with AMI ID** 🆕: For the autoscaling group.
6. **Instance Refresh in Auto-scale Group** 🔄: Implement the latest changes in instances.

## Notes 📝
- Ensure correct workflow definitions in `.github/workflows`.
- Test the AMI build process thoroughly before deployment.

## Conclusion ✨
This CI/CD setup ensures rigorous testing and reliable deployment of your web application, maintaining high code quality and operational efficiency.

## Web Application Features and Testing Instructions

## Application Traffic Source
![Traffic](https://img.shields.io/badge/Traffic-blue) 
- Application traffic is managed through a load balancer.

## Load Balancer Security
![Security](https://img.shields.io/badge/Security-green)
- Load balancer utilizes valid SSL certificates.
- The web application is accessible only through the load balancer.

## Submission Features
![Submission](https://img.shields.io/badge/Submission-orange)
#### :airplane: **POST Requests**: Users can make POST requests for submission.
#### :page_facing_up: **Multiple Submissions**: Users can submit multiple times per assignment based on retries configuration.
#### :no_entry_sign: **Retries Limit**: After exceeding the number of attempts, requests will be rejected.
#### :calendar: **Due Date Enforcement**: Submissions are rejected if the assignment due date has passed.
#### :bell: **Notification**: Submits URL and user info (e.g., email address) to the SNS topic.

## Health Check RESTful API

## Purpose
![Check](https://img.shields.io/badge/Check-blue)
- Monitors the health of the application instance.
- Alerts when instances are not functioning as expected.
- Manages traffic by avoiding unhealthy instances.

## Key Monitoring Aspects
![Monitoring](https://img.shields.io/badge/Monitoring-green)
1. **Database Connection**: Ensures the application's connection to the database.
2. **Downstream API Calls**: Verifies the application's dependency on other APIs and their availability.

## API Endpoints and Testing
![Implementation](https://img.shields.io/badge/Implementation-orange)
- Implemented a `/healthz` [GET] endpoint for health checks.
- Conducted integration tests to ensure reliability.
![Testing](https://img.shields.io/badge/Testing-red)
- Regular testing of the `/healthz` endpoint to verify application connectivity and downstream API functionality.
- [GET] /v1/assignments -- GET All assignments
- [POST] /v1/assignments
- [PUT] /v1/assignments/:id
- [GET] /v1/assignments/:id
- [DELETE] /v1/assignments/:id
- [POST] /v1/assignments/:id/submission -- submit assignment

## Application Logging & Metrics AMI Updates 📊

Integrate CloudWatch for logging and metrics in your AMI.

## CloudWatch Agent Setup 🔄

- **Update Packer Template**: Include CloudWatch Agent installation.
- **Auto-Start Configuration**: Ensure CloudWatch Agent starts automatically on EC2 launch.

## Logging and Metrics 📈

- **Application Logs**: Configure to send log data to CloudWatch.
- **API Usage Metrics**: Track and send metrics on API usage to CloudWatch.
- **Custom Metrics**: Implement custom metrics for API call counts.
- **Metrics Retrieval**: Use StatsD for custom metrics collection.

## Implementation Steps 🛠️

1. **Update AMI**: Modify Packer template to install and configure CloudWatch Agent.
2. **Define Metrics**: Set up necessary custom metrics in the application.
3. **Deploy & Monitor**: Launch EC2 instances and monitor logs and metrics in CloudWatch.

## Useful Commands

## Network Commands
![Network](https://img.shields.io/badge/Network-blue)
- `lsof -i:8080` - List open files on port 8080.
- `kill -9 **pid**` - Force terminate a process.

## Utility Commands
![Utility](https://img.shields.io/badge/Utility-lightgrey)
- `which curl` - Locate the binary, source, and manual page for curl.

## System Updates and Installation
![Installation](https://img.shields.io/badge/Installation-yellow)
- `sudo apt update` - Update package lists.
- `sudo apt install postgresql` - Install PostgreSQL.
- `sudo systemctl start postgresql` - Start PostgreSQL service.

## PostgreSQL Commands
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-blue)
- `SELECT version();` - Display PostgreSQL version.
- `\l` - List all databases.
- `\c postgres` - Connect to the 'postgres' database.
- `\d assignments` - Display the 'assignments' table structure.
- `\q` - Quit the psql terminal.

## Packer - Custom AMI - Github Actions - Raise/merge PR
![Packer](https://img.shields.io/badge/Packer-orange)
- `packer init ami.pkr.hcl`
- `packer validate ami.pkr.hcl`
- `PACKER_LOG=1 packer build ami.pkr.hcl`

## SSH and Key Management
![SSH](https://img.shields.io/badge/SSH-green)
- `chmod 400 /path/my-key-pair.pem` - Secure key file.
- `ssh -i "/path/my-key-pair.pem" admin@[instance-public-ip-or-dns]` - SSH into instance.
- Key-pair location `~/.ssh/`

## PostgreSQL Management (macOS)
![macOS](https://img.shields.io/badge/macOS-red)
- Navigate to PostgreSQL bin: `cd /Applications/Postgres.app/Contents/Versions/latest/bin`
- Connect to PostgreSQL: `./psql -U user_name -d password`

## Service Management
![Service](https://img.shields.io/badge/Service-purple)
- `sudo systemctl status service_name` - Check the status of a service.
- `journalctl -u service_name` - View logs for a service.


## AWS Services and Features 🌐

### Compute and Networking 🖥️
![EC2](https://img.shields.io/badge/-EC2-orange) ![VPC](https://img.shields.io/badge/-VPC-blue) ![Subnets](https://img.shields.io/badge/-Subnets-lightgrey) ![Internet Gateway](https://img.shields.io/badge/-Internet_Gateway-yellow) ![Route Table](https://img.shields.io/badge/-Route_Table-green) ![Lambdas](https://img.shields.io/badge/-Lambda-purple) ![LoadBalancer](https://img.shields.io/badge/-Load_Balancers-red) ![AutoScaler](https://img.shields.io/badge/-Auto_Scaler-purple)

### Storage and Content Delivery 📦
![S3](https://img.shields.io/badge/-S3-blue) ![RDS](https://img.shields.io/badge/-RDS-orange) ![DynamoDB](https://img.shields.io/badge/-DynamoDB-green)

### Security and Identity 🛡️
![IAM](https://img.shields.io/badge/-IAM-yellow) ![Security Groups](https://img.shields.io/badge/-Security_Groups-green) ![Roles & Policies](https://img.shields.io/badge/-Roles_&_Policies-lightgrey) ![SSL Certificates](https://img.shields.io/badge/-SSL_Certificates-blueviolet)

### Networking and Content Delivery 🌍
![Route53](https://img.shields.io/badge/-Route53-blue) ![DNS](https://img.shields.io/badge/-DNS-green) ![Name Servers](https://img.shields.io/badge/-Name_Servers-orange) ![TXT Records](https://img.shields.io/badge/-TXT_Records-red) ![SubDomains](https://img.shields.io/badge/-SubDomains-lightblue)

### Monitoring, Logging, and Notification 📊
![Cloud Watch](https://img.shields.io/badge/-Cloud_Watch-purple) ![StatsD](https://img.shields.io/badge/-StatsD-green) ![RDS Parameter Group](https://img.shields.io/badge/RDS-Parameter_Group-yellow) ![AWS SNS](https://img.shields.io/badge/-AWS_SNS-orange)

### Development and Automation Tools 🛠️
![Git Actions](https://img.shields.io/badge/-Git_Actions-lightgrey) ![Packer](https://img.shields.io/badge/-Packer-blue) ![SystemD](https://img.shields.io/badge/-SystemD-red) ![Shell Script](https://img.shields.io/badge/-Shell_Script-green)
