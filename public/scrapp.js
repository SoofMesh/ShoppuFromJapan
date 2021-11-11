function display()
{
    console.log("you reached ...");
    var url = encodeURIComponent(document.getElementById("scrappUrl").value.toString());
    console.log(url);

    fetch("/scrapp-api", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                            },
                        body: JSON.stringify({url})
                
        }).then((res)=>{
                        console.log(res.body);
              })
}

$(document).ready()
{
    document.getElementById("press").addEventListener("click", display);
}