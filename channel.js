
class Channel
{
    static active;
    static element = {};
    static addNew(name)
    {
        var chanButton = document.createElement('div');
        chanButton.id = name + "-chan-block";
        chanButton.classList.add('btn', 'btn-secondary', 'window-window');
        chanButton.style.width = "100%";
        chanButton.style.height = "50px";
        chanButton.style.marginRight = "3px";
        chanButton.innerHTML = `
                                <div class="">
                                    <div scope="row" class="text-start">
                                        <div id="`+name+`-channel-name" scope="col" class="pb-0 mt-0" style="padding:0px">#`+name+`</div>
                                        <div id="`+name+`-channel-lastsaid" scope="col" class="text-start"></div>
                                    </div>
                                    <div id="`+name+`-channel-users"" class="text-start"></div>
                                    <div id="`+name+`-channel-notif"" class="text-start"></div>
                                </div>`;

        chanButton.addEventListener('click', (e)=>{
            this.switchActive(name+"-channel-output");
        });
        document.getElementById("treebar").appendChild(chanButton);

        var output = document.createElement('div');
        output.id = name+"-channel-output";
        output.classList.add('output', 'bg-nihao');

        const chatwindow = document.getElementById('chatwindow');
        chatwindow.appendChild(output);
        this.switchActive(output.id);

    }
    static delete(id)
    {
        var chanButton = document.getElementById(id);
        chanButton.remove();
    }

    static newTopic(id, topic)
    {
        var element = document.getElementById(id + "-channel-topic") ?? null;
        if (!element)
            return console.log("Couldn't find the channel we have a topic for: #"+id);
        element.innerHTML = Escape(topic);
    }

    static switchActive(dest)
    {
        const outputs = document.querySelectorAll('.output');
        outputs.forEach((o) => {
            if (o.id == dest)
            {
                this.active = '#'+dest.split('-')[0];
                o.removeAttribute('hidden');
                me.active_window = '#'+dest.split('-')[0];
            }
            else
                o.setAttribute('hidden', '');
        });

    }
}