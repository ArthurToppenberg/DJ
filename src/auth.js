function isAuthed(req,res,next){
    //read session id even if undefined
    var session_id = req.session.id;
    if(session_id === undefined){
        res.redirect('/');
        return;
    }
    next();
}

function add_auth(id, req){
    //make promise
    return new Promise((resolve, reject) => {
        //set cookie
        req.session.id = id;
        resolve();
    });
}

module.exports = {
    isAuthed: isAuthed,
    add_auth: add_auth
}