
function getIndex(list, id) {
    for (let i = 0; i < list.length; i++ ) {
        if (list[i].id === id) {
            return i;
        }
    }

    return -1;
}


const messageApi = Vue.resource('/message{/id}');

Vue.component('message-form', {
    props: ['messages', 'messageAttr'],
    data: function() {
        return {
            text: '',
            id: '',
            name: '',
            email:'',
            category: ''
        }
    },
    watch: {
        messageAttr: function(newVal, oldVal) {
            this.email = newVal.email;
            this.text = newVal.text;
            this.id = newVal.id;
            this.name = newVal.name;
            this.category = newVal.category;
        }
    },
    template:
        '<div class="form-feedback">' +
        '<h2 className="h2 mb-5 fw-normal">Please give us feedback</h2>'+
        '<div class="mb-3">'+
        '<input type="text"  placeholder="Enter Name" v-model="name" required autofocus />' +
        '</div>' +
        '<div class="mb-3">' +
        '<input type="text" placeholder="Enter Email" v-model="email" />' +
        '</div>' +
        '<div class="mb-3">' +
        '<input type="text" placeholder="Enter Category" v-model="category" />' +
        '</div>' +
        '<div class="mb-3">' +
        '<input type="text" placeholder="Write text" v-model="text" />' +
        '</div>' +
        '<div class="mb-3">' +
        '<input type="button" value="Send" @click="save" />' +
        '</div>' +
        '</div>',
    methods: {
        save: function() {
            const message = {text: this.text, name: this.name, email: this.email, category: this.category};

            if (this.id) {
                messageApi.update({id: this.id}, message).then(result =>
                    result.json().then(data => {
                        const index = getIndex(this.messages, data.id);
                        this.messages.splice(index, 1, data);
                        this.text = ''
                        this.id = ''
                        this.email = ''
                        this.name = ''
                        this.category = ''
                    })
                )
            } else {
                messageApi.save({}, message).then(result =>
                    result.json().then(data => {
                        this.messages.push(data);
                        this.text = ''
                        this.name = ''
                        this.email = ''
                        this.category = ''
                    })
                )
            }
        }
    }
});

Vue.component('message-row', {
    props: ['message', 'editMethod', 'messages'],
    template: '<div>' +
        '<i>({{ message.id }})</i> <i>{{ message.name }}</i> {{message.email}} {{message.category}} {{message.text}}' +
        '<span style="position: absolute; right: 0">' +
        '<input type="button" value="Edit" @click="edit" />' +
        '<input type="button" value="X" @click="del" />' +
        '</span>' +
        '</div>',
    methods: {
        edit: function() {
            this.editMethod(this.message);
        },
        del: function() {
            messageApi.remove({id: this.message.id}).then(result => {
                if (result.ok) {
                    this.messages.splice(this.messages.indexOf(this.message), 1)
                }
            })
        }
    }
});

Vue.component('messages-list', {
    props: ['messages'],
    data: function() {
        return {
            message: null
        }
    },
    template:
        '<div style="position: relative; width: 300px;">' +
        '<message-form :messages="messages" :messageAttr="message" />' +
        '<message-row v-for="message in messages" :key="message.id" :message="message" ' +
        ':editMethod="editMethod" :messages="messages" />' +
        '</div>',
    created: function() {
        messageApi.get().then(result =>
            result.json().then(data =>
                data.forEach(message => this.messages.push(message))
            )
        )
    },
    methods: {
        editMethod: function(message) {
            this.message = message;
        }
    }
});

const app = new Vue({
    el: '#app',
    template: '<messages-list :messages="messages" />',
    data: {
        messages: []
    }
});
