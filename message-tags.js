class MessageTags {
    tags = {};
    constructor(tagvalues = null)
    {
        if (tagvalues)
        tagvalues.forEach((t) => {

        });
    }
    add(key, value = "")
    {
        this.tags[key] = value;
    }
    del(key)
    {
        this.tags[key] = null;
    }
    generateTags()
    {
        var str = "@";
        for (var key in this.tags) {
            if (this.tags.hasOwnProperty(key)) {
                if (this.tags[key] == null)
                    continue;
                str += key;
                str += this.tags[key].length ? "=" + this.tags[key] : "";
                str += ";";
            }
        }
        return str.slice(0,-1);
    }

}