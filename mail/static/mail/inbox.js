
document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
  
});

function compose_email() {
  //set variables
  const emailRecipients = document.querySelector('#compose-recipients');
  const emailSubject = document.querySelector('#compose-subject');
  const emailBody = document.querySelector('#compose-body');

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  //add eventLitener for each element
  const createEmail = document.querySelectorAll('.create');
  createEmail.forEach(element => {
    element.addEventListener('change', (e) => {
      element.value = e.target.value;
    })
  })

  
  document.getElementById('submit').addEventListener('click', (e) => {
    e.preventDefault();
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: emailRecipients.value,
          subject: emailSubject.value,
          body: emailBody.value,
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    });

// Clear out composition fields
      emailRecipients.value = '';
      emailSubject.value = '';
      emailBody.value = '';
      load_mailbox('inbox');
  })
  
}
function showMailDetails(id) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emailDetails').style.display = 'block';

  if (id) {
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
       
        document.querySelector('#detail_sender').innerHTML = `From: ${email.sender}`;
        email.recipients.forEach(item => {
          document.querySelector('#detail_recipient').innerHTML += `To: ${item}`;
        });
        document.querySelector('#detail_subject').innerHTML = `Subject: ${email.subject}`;
        document.querySelector('#detail_date').innerHTML = `Date: ${email.timestamp}`;
        document.querySelector('#mainBody').innerHTML = `${email.body}`;
    
          document.querySelector('#close').addEventListener('click', () => {
            document.querySelector('#detail_recipient').innerHTML = '';                   
            document.querySelector('#emailDetails').style.display = 'none';
            document.querySelector('#emails-view').style.display = 'block';
          })
    });
    
  }
    
  
}

function load_mailbox(mailbox) {
  document.querySelector('#emailsContent').textContent = '';
  fetch('/emails/inbox')
.then(response => response.json())
.then(emails => {
    // Print emails
    emails.forEach(email => {
      let showMail = document.createElement('li');
      showMail.innerHTML = `${email.sender}, ${email.subject}, ${email.timestamp}`;
      showMail.addEventListener('click', () => {
        emailId = email.id;
        console.log(email);
        showMailDetails(emailId)
        
      });
      const mail = document.querySelector('#emailsContent');
      mail.appendChild(showMail);
      
      })
      
    })
    
    // ... do something else with emails ...
    
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emailDetails').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view h3').innerHTML = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}`;
}


