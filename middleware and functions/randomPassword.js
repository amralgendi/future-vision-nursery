module.exports.randomPassword = function randomPassword(){
                                    const password = [];
                                    const values = "0123456789";
                                    for(let i = 0; i < 4; i++){
                                        password.push(values[Math.floor(Math.random() * (values.length))])
                                    }    
                                    return password.join('')
                                }



