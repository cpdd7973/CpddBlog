tinymce.init({
  selector: '#bioEditor',
  menubar: false,
  toolbar: 'undo redo | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link emoticons',
  height: 300,
});

document.getElementById('submitBio').addEventListener('click', async () => {
  const bio = tinymce.get('bioEditor').getContent({ format: 'text' });
  const userId = '<%= user.id %>'; // Ensure user._id is available in your EJS

  try {
    const response = await fetch(`/user/${userId}/bio`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bio: bio || null }), // Set bio to null if empty
    });

    if (response.ok) {
      const result = await response.json();
      alert(result.message); // Notify the user of success
      location.reload(); // Optionally reload the page to reflect changes
    } else {
      const error = await response.json();
      alert(error.message); // Notify the user of the error
    }
  } catch (error) {
    console.error('Error updating bio:', error);
    alert('An error occurred while updating the bio');
  }
});

const avatarInput = document.getElementById('avatarInput'); // Input element for avatar upload
async function uploadAvatar() {
  // Check if a file is selected
  if (avatarInput.files.length > 0) {
    const formData = new FormData();
    formData.append('avatar', avatarInput.files[0]);

    try {
      const avatarResponse = await fetch('/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      if (!avatarResponse.ok) {
        const error = await avatarResponse.json();
        alert(error.message); // Notify the user of the error
        return;
      }

      const avatarResult = await avatarResponse.json();
      alert(avatarResult.message); // Notify the user of success
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('An error occurred while uploading the avatar');
    }
  }
}

document.querySelectorAll("#avatarInputOverlay, .upload-overlay-svg").forEach(element => {
  element.addEventListener("click", function() {
    document.getElementById('avatarInput').click();
  });
});
