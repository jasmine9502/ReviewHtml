var pageID;
var newsData;
var base64DataImg;
var dataImg = {};

window.onload = function () {
    var locurl = window.location.href; //获得页面的URL
    var startplace = locurl.indexOf("?"); //得到网址与参数分隔符的位置，一般都用“？”分隔
    if (startplace != -1) { //判断网址中有没有参数
        var params = locurl.substr(startplace + 1); //获得参数字符串，从分隔符位置+1处开始获取   结果为id=xxx;
        if (params.substr(3).length > 3) {
            pageID = params.substr(3);}
            console.log(pageID);
        }
        $.ajax({
            url: 'https://lsservice.leicacloud.com:1201/api/AddNews/searchNews?resourceid='+pageID,
            type: 'GET',
            dataType: "json",
            contentType: "application/json;utf-8",
            success: function (data) {
                console.log(data);
                newsData = data;
                document.getElementById("Title01").value = data.title;
                document.getElementById("Time01").value = data.date.substring(0, 10);
                document.getElementById("showImg01").src = data.imageUrl;
                document.getElementById("Url01").value = data.contentUrl;
            },
            error: function (data, status, e) {
                    alert("error");
            }
        });
}

function editSingleNews() {
    if (document.getElementById("showImg01").src.indexOf("http") != -1) {
        updateNews();
    } else {
        var address = document.getElementById("showImg01").src;
        base64DataImg = splitStr(address);
        dataImg["Num"] = 1;
        dataImg["Image1"] = base64DataImg;
        console.log(dataImg);
    $.ajax({
        url: 'https://lsservice.leicacloud.com:1201/api/webpage/image',
        type: 'POST',
        data: JSON.stringify(dataImg),
        dataType: "json",
        contentType: "application/json;utf-8",
        success: function (data, status) {
            if (status == 'success') {
                console.log(data);
                document.getElementById("showImg01").src = data[0];
                updateNews();
            }
        },
        error: function (data, status, e) {
            if (status == 'error') {
                alert("error");
            }
        }
    });
    }
}
function updateNews() {
    newsData["title"] = document.getElementById("Title01").value;
                newsData["date"] = document.getElementById("Time01").value;
                newsData["imageUrl"] = document.getElementById("showImg01").src;
                newsData["contentUrl"] = document.getElementById("Url01").value;
                newsData["resourceid"] = newsData.resourceid;
                newsData["source"] = newsData.source;
                newsData["type"] = newsData.type;
                newsData["typename"] = newsData.typename;
                console.log(newsData);
    $.ajax({
        url: 'https://lsservice.leicacloud.com:1201/api/AddNews/updateNews',
        type: 'POST',
        data: JSON.stringify(newsData),
        dataType: "json",
        contentType: "application/json;utf-8",
        success: function (data, status) {
            console.log(data["Msg"]);
        },
        error: function (data, status, e) {
            if (status == 'error') {
                alert("error");
            }
        }
    });
}

function add() {
    window.location.href = 'Submit.html';
}

function editInfo() {
    window.location.href = 'operate.html';
}