// moment library is easy to use when dealing with time
const moment = require('moment')

function formatMessage(userName, text) {
    return {
        userName,
        text,
        time: moment().format('h:mm a')
    }
}
module.exports = formatMessage