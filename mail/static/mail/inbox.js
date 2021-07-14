
const archive = document.querySelector('#archive');

let isSend = false;

document.addEventListener('DOMContentLoaded', function() {
  
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#close').addEventListener('click', () => {
    document.querySelector('#detail_recipient').innerHTML = '';                   
    document.querySelector('#emailDetails').style.display = 'none';
    document.querySelector('#emails-view').style.display = 'block';
    
    load_mailbox('inbox');
  })

  // By default, load the inbox
  load_mailbox('inbox');
  
});

function compose_email() {
     
  //set variables
  const emailRecipients = document.querySelector('#compose-recipients');
  const emailSubject = document.querySelector('#compose-subject');
  const emailBody = document.querySelector('#compose-body');
  emailRecipients.disabled = false;
  emailSubject.disabled = false;

  emailRecipients.value = '';
  emailSubject.value = '';
  emailBody.value = '';
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display  = 'block';
  document.querySelector('#emailDetails').style.display = 'none';

  //add eventListner for each element
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
      emailBody.textContent = '';
      load_mailbox('inbox');
  })
  
}
function showMailDetails(id) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emailDetails').style.display = 'block';
 
  if(isSend) {
    document.querySelector('#archive').style.display = 'none';
  }else {
    document.querySelector('#archive').style.display = 'inline-block';
  }
  if (id) {
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
        (email.archived)?document.querySelector('#archive').innerHTML = 'Remove': document.querySelector('#archive').innerHTML = 'Archive';
        document.querySelector('#detail_sender').innerHTML = `<span>From:</span> ${email.sender}`;
        document.querySelector('#detail_recipient').innerHTML = '<span>To:</span>';
       email.recipients.forEach(item => {document.querySelector('#detail_recipient').innerHTML += ` ${item} `});
        document.querySelector('#detail_subject').innerHTML = `<span>Subject:</span> ${email.subject}`;
        document.querySelector('#detail_date').innerHTML = `<span>Date:</span> ${email.timestamp}`;
        document.querySelector('#mainBody').innerHTML = `${email.body}`;

        document.querySelector('#reply').addEventListener('click', () => {
          replyEmail(email);
          email = '';
        })
        document.querySelector('#archive').addEventListener('click', () => {
            if(!email.archived) {
              fetch(`/emails/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: true
                })
              })
              // location.reload()
              // load_mailbox('inbox');
              
            }else {
              fetch(`/emails/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: false
                })
              })
              // location.reload();
              // load_mailbox('inbox');
             
            }
            if(!email.read){
              fetch(`/emails/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    read: true
                })
              })
            }
            
            location.reload();
          })
    });
    
  } 
}

function load_mailbox(mailbox) {
  (mailbox === 'sent') ? isSend = true : isSend = false;
  console.log(isSend)
  document.querySelector('#emailsContent').innerHTML = '';
  document.querySelector('#detail_recipient').innerHTML = '';  
  
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    
    console.log(emails)
    emailsLength = emails.length;
    setTimeout(() =>{document.querySelector('h4').innerHTML = `(${emailsLength})`}, 150);
    emails.forEach(email => {
      let showMail = document.createElement('li');
      showMail.innerHTML = `<p class="showSender">${email.sender}:</p><p class="showSubject">${email.subject}</p><p class="showTime">${email.timestamp}</p>`;
      if(email.read) showMail.classList.add('isReaded');
      showMail.addEventListener('click', () => {
        console.log(email);
        // if(email.read) showMail.classList.add('isReaded');
        showMailDetails(email.id)
        
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

function replyEmail(data) {
  const recipients = document.querySelector('#compose-recipients');
  const subject = document.querySelector('#compose-subject');
  const bodyText = document.querySelector('#compose-body');
  const previousText = document.querySelector('#previousText');
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emailDetails').style.display = 'none';
  recipients.disabled = true;
  subject.disabled = true;

  recipients.value = '';
  bodyText.value = '';
  let recipientsData = data.recipients;
  
  if(data) {
    for (let i = 0; i<recipientsData.length; i++) {
      document.querySelector('#compose-recipients').value += ` ${recipientsData[i]} `;
    };

    subject.value = `Re: ${data.subject}`;
    previousText.innerHTML += ` On ${data.timestamp} ${data.sender} wrote:`;
    previousText.innerHTML += `<span>${data.body}</span>`;
  }
  document.getElementById('submit').addEventListener('click', (e) => {
    e.preventDefault()
    console.log(recipients.value)
    console.log(subject.value)
    console.log(bodyText.value)
    fetch(`/emails`, {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients.value,
          subject: subject.value,
          body: bodyText.value,
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    });
    recipients.value =''
    subject.value =''
    bodyText.value = ''
    // load_mailbox('inbox');
})
}
