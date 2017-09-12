var MailListener = require("mail-listener2");
var MailParser = require('mailparser').MailParser;

var parser = new MailParser();

var mailListener = new MailListener({
  username: "letscreatetheapp@gmail.com",
  password: "zhhbqmrleglrnhru",
  host: "imap.gmail.com",
  port: 993,
  tls: true,
  markSeen: true,
  fetchUnreadOnStart: true,
  searchFilter: ["UNSEEN"],
  mailParserOptions: {streamAttachments: true},
  attachments: true,
  attachmentOptions: { directory: "attachments/" } 
});



mailListener.on("server:connected", function(){
  console.log("imapConnected");
});

mailListener.on("server:disconnected", function(){
  console.log("imapDisconnected");
});

// this is where it starts to differ from the first sample

// A more complex example.
// Get the first 20 (UNSEEN) emails, mark them read (\SEEN), 
// and archive them.
(function () {
  // make sure you include in options:  
  //   fetchUnreadOnStart: true,
  var count = 0;

  mailListener.on("mail", function(mail, seqno, attributes) {
    var mailuid = attributes.uid,
      toMailbox = '[Gmail]/All Mail',
      i = ++count;



    /*if (i > 20) {
      mailListener.stop(); // start listening
      return;
    }*/

    console.log('email parsed', { 
      i: i, 
      subject: mail.subject,
      body: mail.text,
      seqno: seqno, 
      uid: attributes.uid,
      attributes: attributes 
    });

    console.log('attempting to mark msg read/seen');
    mailListener.imap.addFlags(mailuid, '\\Seen', function (err) {
      if (err) {
        console.log('error marking message read/SEEN');
        return;
      }

      console.log('moving ' + (seqno || '?') + ' to ' + toMailbox);
        mailListener.imap.move(mailuid, toMailbox, function (err) {
          if (err) {
            console.log('error moving message');
            return;
          }
          console.log('moved ' + (seqno || '?'), mail.subject);
        });
    });
  });

  

  mailListener.on("attachment", function(attachment){
    console.log('have some attachment');
    console.log(attachment);
    // need to work on this code to work for attachment
    parser.on('data', data => {
      console.log('parser data',data);
      if(data.type === 'attachment'){
          console.log('in attachment scope');
          console.log(data.filename);
          data.content.pipe(process.stdout);
          data.on('end', ()=>data.release());
      }
    });

  });


})();


mailListener.start(); // start listening

setTimeout(function () {}, 60*1000);

