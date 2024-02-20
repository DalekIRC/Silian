

function mircToHtml(text) {
    //control codes
    var rex = /\003([0-9]{1,2})[,]?([0-9]{1,2})?([^\003]+)/,
        matches, colors;
    if (rex.test(text)) {
        while (cp = rex.exec(text)) {
            if (cp[1] && cp[1].length == 1)
                cp[1] = "0" + cp[1];

            if (cp[2] && cp[2].length == 1)
            {
                cp[2] = "0" + cp[2];
                var cbg = cp[2];
            }
            var text = text.replace(cp[0], '<span class="'+(cp[1] ? 'IRCCF' + cp[1] : "") + (cbg ? ' IRCCC' + cbg : "") + '">' + cp[3] + '</span>');
        }
    }
    //bold,italics,underline
    var bui = [
        [/\002([^\002]+)(\002)?/, ["<b>", "</b>"]],
        [/\037([^\037]+)(\037)?/, ["<u>", "</u>"]],
        [/\035([^\035]+)(\035)?/, ["<i>", "</i>"]]
    ];
    for (var i = 0; i < bui.length; i++) {
        var bc = bui[i][0];
        var style = bui[i][1];
        if (bc.test(text)) {
            while (bmatch = bc.exec(text)) {
                var text = text.replace(bmatch[0], style[0] + bmatch[1] + style[1]);
            }
        }
    }
    return text;
};

function Escape(string)
{
    string = specialEscape(string);
    string = mircToHtml(string);
    return string;
}

function getElementsByIdRegex(startswith, endswith = null)
{
    var arr = [];
    var str = '[id^="'+startswith+'"]';
    str += endswith ? '[id$="'+endswith+'"]' : '';
    
    Array.from(
        document.querySelectorAll('[id^="edit-tid"][id$="-view"]'))
        .forEach(function (x) { 
           arr.push(x); 
        }
    );

    return arr;
}

function string_starts_with(string, string2)
{
    return string.substring(0, string2.length) == string2;
}

function string_ends_with(string, string2)
{
    let len = '-' + string2.length + 1;
    return string.substring(len, string2.length) == string2;
}

function IsCtcp(string)
{
    if (string_starts_with(string,'\u0001') && string_ends_with(string,'\u0001'))
        return true;
    return false;
}

function doMiddleBubbble(msg)
{
    writeToScreen(
        `<div style="color:var(--qtpi-greydient)" class="text-center">
            <div class="btn btn-dark rounded">
                <i>`+msg+`</i>
            </div>
        </div>`
    );
}