
# Check if the remote origin exists
if git remote | grep origin > /dev/null; then
    echo "Remote origin already exists."
else
    # Add the remote origin since it does not exist
    git remote add origin https://github.com/devopsvconn/vconn-devsecops.git
    echo "Remote origin added."
fi
