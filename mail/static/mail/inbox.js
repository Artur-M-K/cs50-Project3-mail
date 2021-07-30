
let IS_SEND = false;
let IS_IN_BOX = null;

document.addEventListener('DOMContentLoaded', function() {
  
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());

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
        
        const message = document.querySelector('.message');
        if (result.error) {
          message.classList.remove('alert-success');
          message.classList.add('alert-danger');
          message.innerHTML=(`The email was not send - ${result.error}`);
          setTimeout(() => {
            location.reload();
            message.innerHTML='';
            
          },2000);
        }else if (result.message){
          emailBody.value = '';
          message.classList.remove('alert-danger');
          message.classList.add('alert-success');
          message.innerHTML=(result.message);
          setTimeout(() => {
            location.reload();
            message.innerHTML='';
            
          },2000);
        }
    });

// Clear out composition fields
      emailRecipients.value = '';
      emailSubject.value = '';
      emailBody.textContent = '';
      
  })
  return false;
}
function showMailDetails(id) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emailDetails').style.display = 'block';
 
  if(IS_SEND) {
    document.querySelector('#archive').style.display = 'none';
  }else {
    document.querySelector('#archive').style.display = 'inline-block';
  }
 
  if(IS_IN_BOX) {
    document.querySelector('#reply').style.display = 'inline-block';
  }else {
    document.querySelector('#reply').style.display = 'none';
  }

  if (id) {
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {

      if(!email.read){
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        })
      }
        (email.archived)?document.querySelector('#archive').innerHTML = 'Remove': document.querySelector('#archive').innerHTML = 'Archive';
        document.querySelector('#detail_sender').innerHTML = `<span>From:</span> ${email.sender}`;
        document.querySelector('#detail_recipient').innerHTML = '<span>To:</span>';
       email.recipients.forEach(item => {document.querySelector('#detail_recipient').innerHTML += ` ${item} `});
        document.querySelector('#detail_subject').innerHTML = `<span>Subject:</span> ${email.subject}`;
        document.querySelector('#detail_date').innerHTML = `<span>Date:</span> ${email.timestamp}`;
        let dataBody = email.body.replace(/^/gm, "\t");
        
        document.querySelector('#compose-body-reply').value = `${dataBody}`;

        document.querySelector('#reply').addEventListener('click', () => {
          
          replyEmail(email);
        })
        document.querySelector('#archive').addEventListener('click', () => {
            if(!email.archived) {
              fetch(`/emails/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: true
                })
              })
              
            }else {
              fetch(`/emails/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: false
                })
              })
             
            }
            
            location.reload();
          })
    });
    
    
  } 
}

function load_mailbox(mailbox) {
  (mailbox === 'sent') ? IS_SEND = true : IS_SEND = false;
  (mailbox === 'inbox') ? IS_IN_BOX = true : IS_IN_BOX = false;
  
  
  document.querySelector('#detail_recipient').innerHTML = '';  
  
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    document.querySelector('#emailsContent').innerHTML = '';
    emailsLength = emails.length;
    setTimeout(() =>{document.querySelector('h4').innerHTML = `(${emailsLength})`}, 150);
    emails.forEach(email => {
      let showMail = document.createElement('li');
      showMail.innerHTML = `<p class="showSender">${email.sender}:</p><p class="showSubject">${email.subject}</p><p class="showTime">${email.timestamp}</p>`;
      if(email.read) showMail.classList.add('isReaded');
      showMail.addEventListener('click', () => {
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
  
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emailDetails').style.display = 'none';
  recipients.disabled = true;
  subject.disabled = true;

  recipients.value = '';
  bodyText.value = '';
  subject.value = '';
  let recipientsData = data.recipients;
  
  let dataText =`\n \n \n------ On ${data.timestamp} ${data.sender} wrote: \n \n`;
  let dataValue =  document.querySelector('#compose-body').value;
   dataValue = dataText +  data.body.replace(/^/gm, "\t");
  if(data) {
    for (let i = 0; i<recipientsData.length; i++) {
      document.querySelector('#compose-recipients').value += ` ${recipientsData[i]} `;
    };

    subject.value = (data.subject.slice(0,3) === 'Re:')?`${data.subject}`:`Re: ${data.subject}`;
    bodyText.value = dataValue;
  }
  document.getElementById('submit').addEventListener('click', (e) => {
    e.preventDefault()

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
    dataText = ''
    dataResult = ''
    // location.reload();
    load_mailbox('inbox');

})
}
