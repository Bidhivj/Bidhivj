FROM ruby:3.2-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /site

# Copy Gemfile first for caching
COPY Gemfile ./

# Install gems
RUN gem install bundler && bundle install

# Copy the rest of the site
COPY . .

# Expose port 4001 (not 4000)
EXPOSE 4001

# Serve the site
CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--port", "4001", "--livereload", "--livereload-port", "35730"]
