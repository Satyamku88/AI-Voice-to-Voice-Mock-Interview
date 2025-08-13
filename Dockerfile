# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Update package list and install ffmpeg
# This is the equivalent of your build command
RUN apt-get update && apt-get install -y ffmpeg

# Copy the requirements file into the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application's code into the container
COPY . .

# Command to run the application
# This replaces Render's "Start Command". gunicorn is a production-ready server.
CMD ["gunicorn", "--workers", "4", "--bind", "0.0.0.0:10000", "app:app"]