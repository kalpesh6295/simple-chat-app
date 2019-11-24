var socket = io();




function scrollToBottom() {
    // Selectors
    var messages = jQuery('#messages');
    var newMessage = messages.children('li:last-child')
    // Heights
    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();
    console.log(clientHeight + "   " + newMessageHeight + "   " + lastMessageHeight + "   " + scrollTop + "  " + scrollHeight)
    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        messages.scrollTop(scrollHeight);
        console.log('should scrooll');
    }
}




socket.on('connect', () => {
    var params = jQuery.deparam(window.location.search);
    socket.emit('join', params, function(err) {
        if (err) {
            alert(err);
            window.location.href = '/';
        } else {
            console.log('No error');
        }

    })

})

socket.on('disconnect', () => {
    console.log('disconnected to server');

})

socket.on('updateUserList', function(users) {
    var ol = jQuery('<ol></ol>');

    users.forEach(function(user) {
        ol.append(jQuery('<li></li>').text(user));
    });

    jQuery('#users').html(ol);
});

socket.on('newMessage', (message) => {
    var formattedTime = moment(message.createAt).format('h:mm a');
    var template = jQuery('#message-template').html();
    var html = Mustache.render(template, {
        text: message.text,
        from: message.from,
        createAt: formattedTime
    });
    jQuery('#messages').append(html);
    scrollToBottom();
})



jQuery('#message-form').on('submit', function(e) {
    var params = jQuery.deparam(window.location.search);
    e.preventDefault();
    socket.emit('createMessage', {
        from: params.name,
        text: socket.id,
        createAt: new Date().getTime()
    }, function() {
        console.log('got it ');
    });
    jQuery('[name=message]').val(" ");
})