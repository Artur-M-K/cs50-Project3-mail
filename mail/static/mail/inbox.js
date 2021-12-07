//global variables
let IS_SEND = false;
let IS_IN_BOX = true;

document.addEventListener('DOMContentLoaded', function() {
  
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());

  //close email view
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
  //reset values
  emailRecipients.value = '';
  emailSubject.value = '';
  emailBody.value = '';
  //enable input fields
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
  
  //sending a new email
  document.getElementById('submit').addEventListener('click', (e) => {
    e.preventDefault();
    
     fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: emailRecipients.value.split(' ').join(','),
            subject: emailSubject.value,
            body: emailBody.value,
        })
      })
      
      .then((response) =>{ return response.json()})
      .then(result => {
          // Print result
          //show error message if can't send email or success message if everything is ok
          let message = document.querySelector('.message');
         
          (result.error && showError(message, result.error));
          (result.message && showMessage(message, result.message));
          
      }); 
  })
  
}

function showMailDetails(id) {
  
  if (id) {
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
        ((email.archived)?document.querySelector('#archive').innerHTML = 'Remove': 
        document.querySelector('#archive').innerHTML = 'Archive');

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
    })
  }
  //email is read
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
    read: !true && true
    })
    })
    
  // Show emailDetail view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emailDetails').style.display = 'block';
 
  //display archive button if flag is true
  ((IS_SEND) ? document.querySelector('#archive').style.display = 'none' :
  document.querySelector('#archive').style.display = 'inline-block');
  
 
  //display reply button if flag is true
  ((IS_IN_BOX) ? document.querySelector('#reply').style.display = 'inline-block' :
  document.querySelector('#reply').style.display = 'none');

    //archive an email
    
        document.querySelector('#archive').addEventListener('click', () => {
         const isArchived = (document.querySelector('#archive').innerHTML);
         const isArchivedData = (isArchived === 'Archive')? true:false;
          if (id) {
                fetch(`/emails/${id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                      archived: isArchivedData
                  })
                })
            location.reload();
          // })
        }
    }); 
  
}
function load_mailbox(mailbox) {
  //set flags
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
    

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emailDetails').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view h3').innerHTML = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}`;
}

function replyEmail(data) {
//set variables
  const recipients = document.querySelector('#compose-recipients');
  const subject = document.querySelector('#compose-subject');
  const bodyText = document.querySelector('#compose-body');
//switch display
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emailDetails').style.display = 'none';
  recipients.disabled = true;
  subject.disabled = true;
//reset values
  recipients.value = '';
  bodyText.value = '';
  subject.value = '';
  recipients.value = data.sender.split(' ').join(',');
  
  let dataText =`\n \n \n------ On ${data.timestamp} ${data.sender} wrote: \n \n`;
  let dataValue =  document.querySelector('#compose-body').value;
   dataValue = dataText +  data.body.replace(/^/gm, "\t");
  
    subject.value = (data.subject.slice(0,3) === 'Re:')?`${data.subject}`:`Re: ${data.subject}`;
    bodyText.value = dataValue;
  
  document.getElementById('submit').addEventListener('click', () => {

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
    let message = document.querySelector('.message');
    if (result.message) {showMessage(message, result.message)};
});
    
})
}
//show success message if email is send 
function showMessage(item, message) {
          item.classList.remove('alert-danger');
          item.classList.add('alert-success');
          item.innerHTML=(message);
          setTimeout(() => {
            item.innerHTML='';
            load_mailbox('sent');
          },2000);
}
//show error message if email is not send
function showError(item, message) {
          item.classList.remove('alert-success');
          item.classList.add('alert-danger');
          item.innerHTML=(`The email was not send - ${message}`);
          setTimeout(() => {
            item.innerHTML='';
            location.reload();
          },2000);
}
