function send_to(target, mtags, string = null)
{
    var string2 = "";
    if (mtags)
        string2 += mtags.generateTags() + " " + (string ? "PRIVMSG" : "TAGMSG") + " " + target;
    if (string)
        string2 += " :" + string;

    doSend(string2);
}