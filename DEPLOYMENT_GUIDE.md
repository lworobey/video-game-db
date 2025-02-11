# Video Game DB Deployment Guide

## Local Development Setup

### Development Environment
```bash
# Start development environment
docker compose up --build
```
- Uses port 5173 for frontend
- Uses .env file
- Development Dockerfile

### Production Environment (Local Testing)
```bash
# Start production environment
docker compose -f docker-compose.prod.yml --env-file .env.production up --build
```
- Uses port 80 for frontend
- Uses .env.production file
- Production Dockerfile (Dockerfile.prod)
- Uses nginx for serving frontend

## Environment Configuration Best Practices

### Package Versioning
- Use conservative version ranges in package.json
- Specify Node.js version requirements in "engines" field
- Example version ranges:
  ```json
  {
    "dependencies": {
      "express": "^4.18.2",
      "mongoose": "^7.5.0"
    },
    "engines": {
      "node": ">=18.0.0"
    }
  }
  ```

### Environment-Specific Code
- Use environment checks for production-specific features
- Example:
  ```javascript
  const sessionConfig = {
    // Base configuration
  };
  
  if (process.env.NODE_ENV === 'production') {
    // Production-specific settings
  }
  ```

### Session Storage
- Development: Uses MemoryStore (default)
- Production: Uses MongoStore
- Automatically configured based on NODE_ENV

## AWS Deployment Progress

### ✅ Step 1: Setting up ECR Repositories
1. Go to AWS Console
2. Search for "ECR"
3. Create repositories (completed):
   - Created `vgdb-frontend` repository
     - Visibility: Private
     - Tag mutability: Mutable
     - Encryption: AES-256
   - Created `vgdb-auth` repository (same settings)
   - Created `vgdb-game` repository (same settings)
   - Base URL: 122610483526.dkr.ecr.us-east-2.amazonaws.com/

### ✅ Step 2: Configure AWS CLI
1. Install AWS CLI (completed in WSL):
   ```bash
   # Run these commands in WSL
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   sudo apt install unzip
   unzip awscliv2.zip
   sudo ./aws/install
   ```

2. Configure AWS CLI (completed in WSL):
   - Created new access key in AWS Console → Security Credentials
   - Ran `aws configure` in WSL
   - Set region to us-east-2
   - Verified with successful ECR login

### ✅ Step 3: Push Docker Images
1. Verified existing local images (in WSL):
   ```bash
   # Run in WSL
   docker images
   ```
   Found:
   - lukeworobey/vgdb-frontend:latest
   - lukeworobey/vgdb-auth:latest
   - lukeworobey/vgdb-game:latest

2. Tagged images for ECR (completed in WSL):
   ```bash
   # Run these commands in WSL
   docker tag lukeworobey/vgdb-frontend:latest 122610483526.dkr.ecr.us-east-2.amazonaws.com/vgdb-frontend:latest
   docker tag lukeworobey/vgdb-auth:latest 122610483526.dkr.ecr.us-east-2.amazonaws.com/vgdb-auth:latest
   docker tag lukeworobey/vgdb-game:latest 122610483526.dkr.ecr.us-east-2.amazonaws.com/vgdb-game:latest
   ```

3. Pushed to ECR (completed in WSL):
   ```bash
   # Run these commands in WSL
   docker push 122610483526.dkr.ecr.us-east-2.amazonaws.com/vgdb-frontend:latest
   docker push 122610483526.dkr.ecr.us-east-2.amazonaws.com/vgdb-auth:latest
   docker push 122610483526.dkr.ecr.us-east-2.amazonaws.com/vgdb-game:latest
   ```

### ✅ Step 4: Create EC2 Instance
1. Go to AWS Console
2. Search for "EC2"
3. Launch new instance:
   - Name: vgdb-production
   - AMI: Amazon Linux 2023 (free tier eligible)
   - Instance type: t2.micro (free tier eligible)
   - Key pair: Created new key pair
     - Name: vgdb-key
     - Type: RSA
     - Format: .pem

4. ✅ Store SSH Key Securely (WSL):
   ```bash
   # Create .ssh directory if it doesn't exist
   mkdir -p ~/.ssh

   # Copy key from Windows Downloads to WSL
   cp /mnt/c/Users/ljwor/Downloads/vgdb-key.pem ~/.ssh/

   # Set correct permissions
   chmod 400 ~/.ssh/vgdb-key.pem

   # Verify correct permissions
   ls -l ~/.ssh/vgdb-key.pem
   # Should show: -r-------- 1 lukeworobey lukeworobey
   ```
   ✅ Key stored securely in ~/.ssh with correct permissions

5. ✅ Configure Security Group
   - Name: Created automatically (launch-wizard-1)
   - Rules added:
     - SSH (22) - "SSH access for administration"
     - HTTP (80) - "HTTP for web access"
     - HTTPS (443) - "HTTPS for secure web access"
     - Custom TCP (3000) - "Auth service port"
     - Custom TCP (3001) - "Game service port"
   - All rules set to:
     - Source type: Anywhere
     - Source: 0.0.0.0/0

6. ✅ Configure Storage
   - Size: 8 GiB
   - Type: gp3
   - Free tier eligible
   - Default settings sufficient for our needs

### ✅ Step 5: Connect to EC2 Instance
1. ✅ Instance is ready (2/2 checks passed)
2. ✅ Public IPv4 address: 18.117.166.222
3. ✅ Connected via SSH (run in WSL):
   ```bash
   # Run this command in WSL to connect to EC2
   ssh -i ~/.ssh/vgdb-key.pem ec2-user@18.117.166.222
   ```

### Current Step: Install Docker and Docker Compose
1. ✅ Install and configure Docker (run in Amazon Linux EC2):
   ```bash
   # Run these commands in Amazon Linux EC2
   # You should see the Amazon Linux ASCII art in your terminal
   
   # Update the system
   sudo dnf update -y

   # Install Docker
   sudo dnf install docker -y

   # Start Docker service
   sudo systemctl start docker

   # Enable Docker to start on boot
   sudo systemctl enable docker

   # Add ec2-user to docker group
   sudo usermod -aG docker ec2-user
   ```
   ✅ Docker installed and running

2. ✅ Install Docker Compose (run in Amazon Linux EC2):
   ```bash
   # Run these commands in Amazon Linux EC2
   
   # Download Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

   # Make it executable
   sudo chmod +x /usr/local/bin/docker-compose

   # Verify installation
   docker-compose --version
   ```
   ✅ Docker Compose installed (version v2.32.4)

### Current Step: Configure AWS Credentials and Pull Images
1. Configure AWS credentials on EC2 (run in Amazon Linux EC2):
   ```bash
   # Run this in Amazon Linux EC2
   aws configure
   # You will be prompted for:
   # - AWS Access Key ID
   # - AWS Secret Access Key
   # - Default region name (enter: us-east-2)
   # - Default output format (enter: json)
   
   # Note: If you see "Unable to locate credentials" error, this confirms you need to run aws configure
   ```

2. Login to ECR (run in Amazon Linux EC2):
   ```bash
   # Run this in Amazon Linux EC2
   aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 122610483526.dkr.ecr.us-east-2.amazonaws.com
   ```
   ✅ Login succeeded

3. Pull images from ECR (run in Amazon Linux EC2):
   ```bash
   # Run these commands in Amazon Linux EC2
   docker pull 122610483526.dkr.ecr.us-east-2.amazonaws.com/vgdb-frontend:latest
   docker pull 122610483526.dkr.ecr.us-east-2.amazonaws.com/vgdb-auth:latest
   docker pull 122610483526.dkr.ecr.us-east-2.amazonaws.com/vgdb-game:latest
   ```
   ✅ Images pulled successfully

4. Verify images (run in Amazon Linux EC2):
   ```bash
   # Run this command in Amazon Linux EC2
   docker images
   ```
   Should see all three images:
   - vgdb-frontend:latest
   - vgdb-auth:latest
   - vgdb-game:latest
   ✅ All images present and ready

### Troubleshooting Notes:
1. AWS Credentials:
   - You must configure AWS credentials in TWO places:
     1. Your local WSL environment (for pushing to ECR)
     2. The Amazon Linux EC2 instance (for pulling from ECR)
   - The error "Unable to locate credentials" means you need to run `aws configure`
   - Use the same credentials in both places
   - To find your existing credentials, check `~/.aws/credentials` in your local WSL

2. ECR Login:
   - The login command must be run on the EC2 instance (Amazon Linux)
   - You'll know you're on EC2 if you see the Amazon Linux ASCII art and prompt like `[ec2-user@ip-...]`
   - You'll know you're in WSL if your prompt shows your username and computer name
   - Login must succeed before pulling images

### Current Step: Set Up Environment Variables
1. ✅ Create production environment file:
   ```bash
   # Run this in Amazon Linux EC2
   nano .env.production
   ```
   Required variables:
   - NODE_ENV=production
   - MONGODB_URI
   - DISCORD_CLIENT_ID
   - DISCORD_CLIENT_SECRET
   - DISCORD_REDIRECT_URI (use EC2 IP)
   - JWT_SECRET
   - FRONTEND_URL (use EC2 IP)

2. ✅ Configure Discord OAuth:
   - Update Discord Developer Portal settings
   - Add redirect URL with EC2 IP
   - Ensure environment variables match

3. ✅ Session Storage Configuration:
   - Production uses MongoStore
   - Automatically configured when NODE_ENV=production
   - No additional setup needed

### Troubleshooting Notes:
1. AWS Credentials:
   - Configure in both WSL and EC2
   - Use `aws configure` in both environments
   - Check `~/.aws/credentials` for existing settings

2. ECR Login:
   - Run on EC2 instance
   - Verify environment before running commands
   - Login must succeed before pulling images

3. Environment Configuration:
   - Check NODE_ENV is set to 'production'
   - Verify MongoDB connection string
   - Ensure Discord OAuth URLs use EC2 IP
   - Session storage switches automatically

4. Package Version Issues:
   - Use `npm ci` instead of `npm install` in production
   - Check package.json for compatible versions
   - Use version ranges specified in guide
   - Run `npm audit` to check for vulnerabilities

### CI/CD Considerations:
1. Version Control:
   - Don't commit .env files
   - Use .env.example as template
   - Document required environment variables

2. Dependencies:
   - Use conservative version ranges
   - Specify Node.js version requirements
   - Keep dependencies up to date but stable

3. Build Process:
   - Use multi-stage Docker builds
   - Implement proper health checks
   - Set appropriate environment variables

4. Testing:
   - Run tests before deployment
   - Verify OAuth flow in staging
   - Check session handling
   - Validate MongoDB connections

### Current Step: Copy docker-compose file
1. ✅ Copy docker-compose file:
   ```bash
   # Run this in WSL
   scp -i ~/.ssh/vgdb-key.pem docker-compose.prod.yml ec2-user@18.117.166.222:~/
   ```
   ✅ File copied successfully

### Current Step: Start the services
1. ✅ Start the services:
   ```bash
   # Run this in Amazon Linux EC2
   # Note: Use docker-compose (with hyphen) on Amazon Linux, not docker compose
   docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
   ```
   ✅ Services started successfully

### Current Step: Verify services
1. Check running containers:
   ```bash
   # Run this in Amazon Linux EC2
   docker ps
   ```

2. Check service logs:
   ```bash
   # Run this in Amazon Linux EC2
   docker-compose -f docker-compose.prod.yml logs
   ```

### Next Steps:
1. Test all services
   - Frontend (http://18.117.166.222)
   - Auth service (port 3000)
   - Game service (port 3001)
2. Configure domain and SSL (optional)

### Troubleshooting Notes:
1. AWS Credentials:
   - Configure in both WSL and EC2
   - Use `aws configure` in both environments
   - Check `~/.aws/credentials` for existing settings

2. ECR Login:
   - Run on EC2 instance
   - Verify environment before running commands
   - Login must succeed before pulling images

3. Environment Configuration:
   - Check NODE_ENV is set to 'production'
   - Verify MongoDB connection string
   - Ensure Discord OAuth URLs use EC2 IP
   - Session storage switches automatically

4. Package Version Issues:
   - Use `npm ci` instead of `npm install` in production
   - Check package.json for compatible versions
   - Use version ranges specified in guide
   - Run `npm audit` to check for vulnerabilities

### CI/CD Considerations:
1. Version Control:
   - Don't commit .env files
   - Use .env.example as template
   - Document required environment variables

2. Dependencies:
   - Use conservative version ranges
   - Specify Node.js version requirements
   - Keep dependencies up to date but stable

3. Build Process:
   - Use multi-stage Docker builds
   - Implement proper health checks
   - Set appropriate environment variables

4. Testing:
   - Run tests before deployment
   - Verify OAuth flow in staging
   - Check session handling
   - Validate MongoDB connections

### Optional Future Steps:
- Configure domain name
- Set up SSL certificates
- Implement security hardening
- Set up monitoring

## Environment Files

### Development (.env)
- Frontend URL: http://localhost:5173
- Auth Service: http://localhost:3000
- Game Service: http://localhost:3001

### Production (.env.production)
- Frontend URL: http://localhost (port 80)
- Auth Service: http://localhost:3000
- Game Service: http://localhost:3001

## Docker Configuration

### Development
- Uses default docker-compose.yml
- Development Dockerfile
- Hot reloading enabled

### Production
- Uses docker-compose.prod.yml
- Uses Dockerfile.prod
- Nginx configuration for serving static files
- Optimized build process 