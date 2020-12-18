/* 处理导入的xlsx表格 */
var XLSX = require('xlsx');
var urls = [];
var httpsUrls = [];
var finalUrls = [];
var http = require('http');
var https = require('https');
//temp 信息
var htmlImgs = [];
var htmlTitles = [];
var htmlTimes = [];
var httpsImgs = [];
var httpsTitles = [];
var httpsTimes = [];
//最终信息
var images = [];
var titles = [];
var times = [];
var uploadData = [];
//是否导入表格
var isNoDiv = "yes";

var process_wb = (function () {
    htmlImgs = [];
    htmlTitles = [];
    htmlTimes = [];
    httpsImgs = [];
    httpsTitles = [];
    httpsTimes = [];
    images = [];
    titles = [];
    times = [];
    var HTMLOUT = document.getElementById('htmlout');
    return function process_wb(wb) {
        HTMLOUT.innerHTML = "";
        wb.SheetNames.forEach(function (sheetName) {
            var htmlstr = XLSX.utils.sheet_to_html(wb.Sheets[sheetName], {
                editable: true
            });
            HTMLOUT.innerHTML += htmlstr;
        });
        //获取表格urls
        urls = [];
        httpsUrls = [];
        var tds = document.getElementsByTagName("td");
        for (var i = 0; i < tds.length; i++) {
            var table = tds[i].getElementsByTagName("span")[0].innerHTML;
            if (table.indexOf("https") != -1) {
                httpsUrls[i] = table;
            } else {
                urls[i] = table;
            }
            finalUrls[i]=table;
        }
        for (var i = 0; i < urls.length; i++) {
            console.log(urls[i]);
            if (urls[i]) {
                loadPage(urls[i]).then(function (d) {
                    //获取Title
                    htmlTitles.push(getTitle(d));
                    //获取Time    
                    if(!(getTime(d)=="")){
                        htmlTimes.push(getTime(d));
                    } else {
                        htmlTimes.push(getHttpsTime(d));
                    }    
                    // 匹配src属性
                    if(getImage(d)) {
                        htmlImgs.push(getImage(d));
                    } else {
                        htmlImgs.push(getHttpsImg(d));
                    }
                    var r = urls.filter(function (s) {
                        return s && s.trim(); // 注：IE9(不包含IE9)以下的版本没有trim()方法
                    });
                    if (htmlImgs.length == r.length) {
                        for (var i = 0; i < urls.length; i++) {
                            if (urls[i]) {
                                titles[i] = htmlTitles.shift();
                                times[i] = htmlTimes.shift();
                                images[i] = htmlImgs.shift();
                            }
                        }
                        if(finalUrls.length == titles.length) {
                            showInfo();
                        }
                    }
                });
            }
        }
        for (var i = 0; i < httpsUrls.length; i++) {
            console.log(httpsUrls[i]);
            if (httpsUrls[i]) {
                loadPageHttps(httpsUrls[i]).then(function (d) {
                    //获取Title
                    httpsTitles.push(getHttpsTitle(d));
                    httpsTimes.push(getHttpsTime(d));
                    //匹配src属性
                    httpsImgs.push(getHttpsImg(d));
                    var r = httpsUrls.filter(function (s) {
                        return s && s.trim(); // 注：IE9(不包含IE9)以下的版本没有trim()方法
                    });
                    if (httpsImgs.length == r.length) {
                        for (var i = 0; i < httpsUrls.length; i++) {
                            if (httpsUrls[i]) {
                                titles[i] = httpsTitles.shift();
                                times[i] = httpsTimes.shift();
                                images[i] = httpsImgs.shift();
                            }
                        }
                        if(finalUrls.length == titles.length) {
                            showInfo();
                        }
                    }
                });
            }
        }
    }
})();

var do_file = (function () {
    return function do_file(files) {
        var f = files[0];
        if(f) {
            var reader = new FileReader();
        reader.onload = function (e) {
            var data = e.target.result;
            data = new Uint8Array(data);
            process_wb(XLSX.read(data, {
                type: 'array'
            }));
        };
        reader.readAsArrayBuffer(f);
        }
    };
})();

(function () {
    if(window.location.href.indexOf("?")==-1) {
        var xlf = document.getElementById('xlf');
        function handleFile(e) {
            do_file(e.target.files);
        }
        xlf.addEventListener('change', handleFile, false);
        console.log(window.location.href);
        console.log(window.location.href.indexOf("?"));
    } else {
        console.log(window.location.href);
        console.log(window.location.href.indexOf("?"));
    }
})();


//上传图片
var dataRequire = {};
//待去除前缀图片
var base64Data = [];
//获取图片url
var getData;
var imageUp = [];
//增加div数
var newDivNum = 0;

/*图片预览实现*/
function showImage(obj, imgID) {
    var file = obj.files[0];
    if (window.FileReader) {
        var fr = new FileReader();
        fr.onloadend = function (e) {
            dealImage(e.target.result, {
                quality: 0.6
            }, function (base) {
                document.getElementById(imgID).src = base;
            })
        };
        fr.readAsDataURL(file);
    }
}
//压缩图片
function dealImage(path, obj, callback) {
    var img = new Image();
    img.src = path;
    img.onload = function () {
        var that = this;
        // 默认按比例压缩
        var w = that.width,
            h = that.height,
            scale = w / h;
        w = obj.width || w;
        h = obj.height || (w / scale);
        var quality = 0.6; // 默认图片质量为0.7
        //生成canvas
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        // 创建属性节点
        var anw = document.createAttribute("width");
        anw.nodeValue = w;
        var anh = document.createAttribute("height");
        anh.nodeValue = h;
        canvas.setAttributeNode(anw);
        canvas.setAttributeNode(anh);
        ctx.drawImage(that, 0, 0, w, h);
        // 图像质量
        if (obj.quality && obj.quality <= 1 && obj.quality > 0) {
            quality = obj.quality;
        }
        var base64 = canvas.toDataURL('image/jpeg', quality);
        // 回调函数返回base64的值
        callback(base64);
    }
}

function call(imgID, inputID) {
    document.getElementById(imgID).src = "https://lsservice.leicacloud.com:1201/WebpageTemplate/Image/8.png";
    document.getElementById(inputID).value = "";
}

//切割图片base64编码
function splitStr(str) {
    var result;
    var arr = str.split(',');
    arr.shift();
    result = arr.join();
    result = result.replace(/\/\//g, "1234567");
    return result;
}

/*增加填充div*/
function addContainer() {
    if(isNoDiv == "yes") {
        var checkNode = document.getElementById("info");
        checkNode.innerHTML = "<div class=\"content\" id=\"content01\"><div class=\"contentText\"><p class=\"normal\">标题</p><textarea class=\"titles\" type=\"text\" id=\"Title01\" cols=\"60\" rows=\"2\"></textarea><p class=\"normal\">日期</p><textarea class=\"titles\" type=\"text\" id=\"Time01\" cols=\"30\" rows=\"1\"></textarea><p class=\"normal\">网址</p><textarea class=\"titles\" type=\"text\" id=\"Url01\" cols=\"60\" rows=\"3\"></textarea><button class=\"search\" id=\"search\" onclick='searchUrl(this)'>添加该网址</button></div><div class=\"contentImg\"><p class=\"normal]\">图片:<span style=\"font-size: 10px\">(可以更换本地图片)</span></p><input type=\"file\" id=\"readImg01]\" onchange=\"showImage(this,'showImg01')\" accept=\"image/*\" value=\"选择图片\" /><input type=\"button\" value=\"取消该图片\" onclick=\"call('showImg01','readImg01');\" /><img id=\"showImg01\" style=\"border: solid #afafaf 0.8px\" src=\"https://lsservice.leicacloud.com:1201/WebpageTemplate/Image/8.png\"/></div></div>";
        isNoDiv = "no";
    } else {
        newDivNum++;
        var imgName = "showImg0" + (newDivNum + 1);
        var contentID = "content0" + newDivNum;
        var contentRID = "content0" + (newDivNum + 1);
        var titleID = "Title0" + (newDivNum + 1);
        var timeID = "Time0" + (newDivNum + 1);
        var urlID = "Url0" + (newDivNum + 1);
        var inputID = "readImg0" + (newDivNum + 1);
        var container = document.getElementById(contentID);
        var node = container.nextSibling;
        var oDiv = document.createElement('div');
        var divattr = document.createAttribute("class");
        divattr.value = "content";
        oDiv.setAttributeNode(divattr);
        oDiv.id = contentRID;
        var inner = "<div class='contentText'><p class=\"normal\">标题：</p><textarea class=\"titles\" type=\"text\" id=" + titleID + " cols='60' rows='2'></textarea><p class=\"normal\">日期：</p><textarea class=\"titles\" type=\"text\" id=" + timeID + " cols='30' rows='1'></textarea><p class=\"normal\">网址：</p><textarea class=\"titles\" type=\"text\" id="+urlID+" cols=\"60\" rows=\"3\"></textarea><button class=\"search\" id=\"search\" onclick='searchUrl(this)'>添加该网址</button></div><div class='contentImg'><p>图片:<span style=\"font-size: 10px\">((可以更换本地图片))</span></p>";
        inner += "<input type=\"file\" id=" + inputID + " onchange=\"showImage(this,'" + imgName + "')\" accept=\"image/*\" value=\"选择图片\" /><input type=\"button\" value=\"添加该网址\" onclick=\"call('" + imgName + "','" + inputID + "');\" /><img id=" + imgName + " style=\"border: solid #afafaf 0.8px\"src = \"https://lsservice.leicacloud.com:1201/WebpageTemplate/Image/8.png\"/></div>";
        oDiv.innerHTML = inner;
        container.parentNode.insertBefore(oDiv, node)
        node = oDiv.nextSibling;
    }
}

/*删除填充div*/
function deleteContainer(test) {
    var node = test.parentNode.nextSibling;
    delNode = test;
    if (node.id == undefined) {
        test.parentNode.parentNode.removeChild(test.parentNode);
        newDivNum--;
    } else {
        var containerNum = node.id.substring(8, node.id.length);
        test.parentNode.parentNode.removeChild(test.parentNode);
        for (var i = containerNum; i <= newDivNum + 1; i++) {
            var changeID = "content0" + i;
            var change = document.getElementById(changeID);
            var shouldChangeID = "content0" + (i - 1);
            change.id = shouldChangeID;
            var img = document.getElementById(shouldChangeID).getElementsByTagName("img");
            var idname = "showImg0" + (i - 1);
            img[0].id = idname;
            var inputs = document.getElementById(shouldChangeID).getElementsByTagName("input");
            var inputID = "readImg0" + (i - 1);
            inputs[0].outerHTML = "<input type=\"file\" id=\"readImg\" onchange=\"showImage(this,'" + idname + "')\" accept=\"image/*\" value=\"选择图片\" />";
            inputs[1].outerHTML = "<input type=\"button\" value=\"取消该图片\" onclick=\"call('" + idname + "','" + inputID + "');\" />"
            var textareas = document.getElementById(shouldChangeID).getElementsByTagName("textarea");
            textareas[0].id = "Title0" + (i - 1);
        }
        newDivNum--;
    }
}

//输入网址显示新闻
function searchUrl(test) {
    var node = test.parentNode.parentNode;
    var num = node.id.substring(8, node.id.length);
    var urlid = "Url0" + num;
    var titleid = "Title0" + num;
    var timeid = "Time0" + num;
    var imgid  = "showImg0" + num;
    var url=document.getElementById(urlid).value;
    if(url.indexOf("https") !=-1) {
        httpsUrls[num] = url;
        loadPageHttps(url).then(function (d) {
            htmlTitles[num]= getHttpsTitle(d);
            document.getElementById(titleid).innerHTML = htmlTitles[num];
            //获取Time        
            htmlTimes[num] = getHttpsTime(d);
            document.getElementById(timeid).innerHTML = htmlTimes[num];
            // 匹配src属性
            htmlImgs[num] = getHttpsImg(d);
            document.getElementById(imgid).src = htmlImgs[num];
        });
    } else {
        if(url.indexOf("http") !=-1) {
            urls[num] = url;
            loadPage(url).then(function (d) {
                htmlTitles[num]= getTitle(d);
                document.getElementById(titleid).innerHTML = htmlTitles[num];
                //获取Time   
                if(!(getTime(d)=="")){
                    htmlTimes[num] = getTime(d);
                } else {
                    htmlTimes[num] = getHttpsTime(d);
                }
                document.getElementById(timeid).innerHTML = htmlTimes[num];
                // 匹配src属性
                if(getImage(d)) {
                    htmlImgs[num] = getImage(d)
                } else {
                    htmlImgs[num] = getHttpsImg(d);
                }
                document.getElementById(imgid).src = htmlImgs[num];
            });
        } else{
            alert("请输入正确网址");
        }
    }
}

//填充cell
function showInfo() {
    isNoDiv = "no";
    var r = titles.filter(function (s) {
        return s && s.trim(); // 注：IE9(不包含IE9)以下的版本没有trim()方法
    });
    if(r.length==finalUrls.length){
        document.getElementById("add").style.display = "inline-block";
    } else {
        document.getElementById("add").style.display = "none";
    }
    if (finalUrls.length - 1 >= 0) {
        newDivNum = finalUrls.length - 1;
    } else {
        newDivNum = 0;
    }
    for (var i = 0; i <= newDivNum; i++) {
        var imgName = "showImg0" + (i + 1);
        var contentID = "content0" + i;
        var contentRID = "content0" + (i + 1);
        var titleID = "Title0" + (i + 1);
        var inputID = "readImg0" + (i + 1);
        var timeID = "Time0" + (i + 1);
        var urlID = "Url0" + (i+1);
        if (i >= 1) {
            var container = document.getElementById(contentID);
            var node = container.nextSibling;
            var oDiv = document.createElement('div');
            var divattr = document.createAttribute("class");
            divattr.value = "content";
            oDiv.setAttributeNode(divattr);
            oDiv.id = contentRID;
            var inner = "<div class='contentText'><p class=\"normal\">标题：</p><textarea class=\"titles\" type=\"text\" id=" + titleID + " cols='60' rows='2'></textarea><p class=\"normal\">日期：</p><textarea class=\"titles\" type=\"text\" id=" + timeID + " cols='30' rows='1'></textarea><p class=\"normal\">网址：</p><textarea class=\"titles\" type=\"text\" id=" + urlID + " cols='60' rows='3'></textarea><button class=\"search\" id=\"search\" onclick='searchUrl(this)'>添加该网址</button></div><div class='contentImg'><p>图片:<span style=\"font-size: 10px\">((可以更换本地图片))</span></p>";
            inner += "<input type=\"file\" id=" + inputID + " onchange=\"showImage(this,'" + imgName + "')\" accept=\"image/*\" value=\"选择图片\" /><input type=\"button\" value=\"取消该图片\" onclick=\"call('" + imgName + "','" + inputID + "');\" /><img id=" + imgName + " style=\"border: solid #afafaf 0.8px\"src = \"https://lsservice.leicacloud.com:1201/WebpageTemplate/Image/8.png\"/></div>";
            oDiv.innerHTML = inner;
            container.parentNode.insertBefore(oDiv, node)
            node = oDiv.nextSibling;
            if(titles[i]) {
                document.getElementById(titleID).innerHTML = titles[i];
            }
            if(times[i]) {
                document.getElementById(timeID).innerHTML = times[i];
            }
            if(images[i]) {
                if(images[i]==""|| !(images[i].indexOf("http") !=-1)) {
                    document.getElementById(imgName).src ="https://lsservice.leicacloud.com:1201/WebpageTemplate/Image/8.png";
                } else {
                    document.getElementById(imgName).src = images[i];
                }
            }
            if(urls[i]) {
                document.getElementById(urlID).innerHTML = urls[i];
            } else {
                document.getElementById(urlID).innerHTML = httpsUrls[i];
            }
        } else {
            var checkNode = document.getElementById("info");
            checkNode.innerHTML = "<div class=\"content\" id=\"content01\"><div class=\"contentText\"><p class=\"normal\">标题</p><textarea class=\"titles\" type=\"text\" id=\"Title01\" cols=\"60\" rows=\"2\"></textarea><p class=\"normal\">日期</p><textarea class=\"titles\" type=\"text\" id=\"Time01\" cols=\"30\" rows=\"1\"></textarea><p class=\"normal\">网址</p><textarea class=\"titles\" type=\"text\" id=\"Url01\" cols=\"60\" rows=\"3\"></textarea><button class=\"search\" id=\"search\" onclick='searchUrl(this)'>添加该网址</button></div><div class=\"contentImg\"><p class=\"normal]\">图片:<span style=\"font-size: 10px\">(可以更换本地图片)</span></p><input type=\"file\" id=\"readImg01]\" onchange=\"showImage(this,'showImg01')\" accept=\"image/*\" value=\"选择图片\" /><input type=\"button\" value=\"取消该图片\" onclick=\"call('showImg01','readImg01');\" /><img id=\"showImg01\" style=\"border: solid #afafaf 0.8px\" src=\"https://lsservice.leicacloud.com:1201/WebpageTemplate/Image/8.png\"/></div></div>";
            if(titles[0]) {
                document.getElementById("Title01").innerHTML = titles[0];
            }
            if(times[0]) {
                document.getElementById("Time01").innerHTML = times[0];
            }
            if(images[0]) {
                if(images[0]==""||!(images[0].indexOf("http") !=-1)) {
                    document.getElementById("showImg01").src ="https://lsservice.leicacloud.com:1201/WebpageTemplate/Image/8.png";
                } else {
                    document.getElementById("showImg01").src = images[0];
                }
            }
            if(urls[0]) {
                document.getElementById("Url01").innerHTML = urls[0];
            } else {
                document.getElementById("Url01").innerHTML = httpsUrls[0];
            }
        }
        checkUrl(urlID);
    }
}


function loadPage(url) {
    var pm = new Promise(function (resolve, reject) {
        http.get(url, function (res) {
            var html = '';
            res.on('data', function (d) {
                html += d.toString()
            });
            res.on('end', function () {
                resolve(html);
            });
        }).on('error', function (e) {
            reject(e)
        });
    });
    return pm;
}

function loadPageHttps(url) {
    var pm = new Promise(function (resolve, reject) {
        https.get(url, function (res) {
            var html = '';
            res.on('data', function (d) {
                html += d.toString()
            });
            res.on('end', function () {
                resolve(html);
            });
        }).on('error', function (e) {
            reject(e)
        });
    });
    return pm;
}

//获取标题
function getTitle(info) {
    var fontReg = /<font>([\S\s]*?)<\/font>/;
    var titlearr = info.match(fontReg);
    var backtitle;
    if(titlearr){
         backtitle = titlearr[1].replace(/[\r\n]/g, "").replace(/^\s*|\s*$/g, "");
    } else {
        backtitle = "";
    }
    return backtitle;
}

function getHttpsTitle(info) {
    let fontReg = /<h2 class="rich_media_title" id="activity-name">([\S\s]*?)<\/h2>/;
    let titlearr = info.match(fontReg);
    var backtitle;
    if(titlearr) {
        backtitle = titlearr[1].replace(/[\r\n]/g, "").replace(/^\s*|\s*$/g, "");
    } else {
        backtitle = "";
    }
    return backtitle;
}

//获取时间
function getTime(info) {
    let timeReg = /<td style="font-size: 0.8em; color: #666666">([\S\s]*?)&nbsp;&nbsp;&nbsp/;
    let timearr = info.match(timeReg);
    var backTime;
    if(timearr) {
       backTime =  timearr[1].replace(/[\r\n]/g, "").replace(/^\s*|\s*$/g, "");
       if(!backTime) {
        backTime = getNowFormatDate();
    }
    } else {
       backTime = getNowFormatDate();
    }
    return backTime;
}

function getHttpsTime(info) {
    var timeReg = /<em id="publish_time" class="rich_media_meta rich_media_meta_text">([\S\s]*?)<\/em>/;
    var timearr = info.match(timeReg);
    var backtime;
    if(timearr) {
        backtime = timearr[1].replace(/[\r\n]/g, "").replace(/^\s*|\s*$/g, "")
        if(!backtime) {
            backtime = getNowFormatDate();
        }
    } else {
        backtime = getNowFormatDate();
    }
    return backtime;
}

//获取图片
function getImage(info) {
    let imgReg = /<img.*?(?:>|\/>)/;
    let nameReg = /src=\"([^\"]*?)\"/gi;
    let arr = info.match(imgReg);
    let names = arr[0].match(nameReg);
    names = names[0].substring(5, names[0].length - 1);
    return names;
}

function getHttpsImg(info) {
    let imgReg = /<img class="rich_pages.*?(?:>|\/>)/;
    let imgReg2 = /<img data-ratio.*?(?:>|\/>)/
    let nameReg = /src=\"([^\"]*?)\"/gi;
    let arr = info.match(imgReg);
    let names;
    if(arr){
        names = arr[0].match(nameReg);
        if(names == "") {
            arr = info.match(imgReg2);
            names = arr[0].match(nameReg);
        }
    } else {
        arr = info.match(imgReg2);
        if(arr){
            names = arr[0].match(nameReg);
        } else {
            names =["src = "];
        }
    }
    names = names[0].substring(5, names[0].length - 1);
    return names;
}

//增加定时器检查信息正误
function checkUrl(url) {
    window.setTimeout("searchUrl("+url+")",1000); 
}

//提交信息
function submitInfo() {
    images = [];
    titles = [];
    times = [];
    finalUrls = [];
    for (var i = 0; i <= newDivNum; i++) {
        var imgName = "showImg0" + (i + 1)
        var title = "Title0" +(i+1);
        var time = "Time0"+(i+1);
        var url = "Url0" +(i+1);
        images[i] = document.getElementById(imgName).src;
        titles[i] = document.getElementById(title).value;
        times[i] = document.getElementById(time).value;
        finalUrls[i] = document.getElementById(url).value;
    }
    console.log(images);
    console.log(titles);
    console.log(times);
    console.log(finalUrls);
    var imgHave = 0;
    dataRequire = {};
    var require = [];
    for (var i = 0; i <= newDivNum; i++) {
        if (images[i].indexOf("http") != -1) {
        } else {
            imgHave++;
            var address = images[i];
            base64Data[i] = splitStr(address);
            require.push(base64Data[i]);
        }
    }
    dataRequire["Num"] = imgHave;
    for (var j = 0; j < require.length; j++) {
        dataRequire["Image" + (j + 1)] = require[j];
    }
    console.log(dataRequire);
    $.ajax({
        url: 'https://lsservice.leicacloud.com:1201/api/webpage/image',
        type: 'POST',
        data: JSON.stringify(dataRequire),
        dataType: "json",
        contentType: "application/json;utf-8",
        success: function (data, status) {
            if (status == 'success') {
                getData = data;
                doGet();
                var radio = document.getElementsByName("listType");
                if(radio[0].checked == true) {
                    addNews();
                } else {
                    addProductNews();
                }
            }
        },
        error: function (data, status, e) {
            if (status == 'error') {
                alert("error");
            }
        }
    });
}

function doGet() {
    imageUp = images;
    for (var i = 0; i < imageUp.length; i++) {
        if (imageUp[i].indexOf("http") != -1) {
        } else {
            imageUp[i] = getData.shift();
        }
    }
    console.log(imageUp);
}

function addNews() {
    var uploadArray = [];
    for(var i =0;i<=newDivNum;i++) {
        var newsData = {};
        newsData["title"] = titles[i];
        newsData["date"] = times[i];
        newsData["imageUrl"] = imageUp[i];
        newsData["contentUrl"] = finalUrls[i];
        uploadArray.push(newsData);
    }
    var uploadData = {};
    uploadData["dataList"] = uploadArray;
    console.log(uploadData);
    $.ajax({
        url: 'https://lsservice.leicacloud.com:1201/api/AddNews/leicaNews',
        type: 'POST',
        data: JSON.stringify(uploadData),
        dataType: "json",
        contentType: "application/json;utf-8",
        success: function (data, status) {
            console.log(data["Msg"]);
            window.location.href = 'success.html';
        },
        error: function (data, status, e) {
            if (status == 'error') {
                alert("error");
            }
        }
    });
}

function addProductNews() {
    var uploadArray = [];
    for(var i =0;i<=newDivNum;i++) {
        var newsData = {};
        newsData["title"] = titles[i];
        newsData["date"] = times[i];
        newsData["imageUrl"] = imageUp[i];
        newsData["contentUrl"] = finalUrls[i];
        uploadArray.push(newsData);
    }
    var uploadData = {};
    uploadData["dataList"] = uploadArray;
    console.log(uploadData);
    $.ajax({
        url: 'https://lsservice.leicacloud.com:1201/api/AddNews/industryNews',
        type: 'POST',
        data: JSON.stringify(uploadData),
        dataType: "json",
        contentType: "application/json;utf-8",
        success: function (data, status) {
            console.log(data["Msg"]);
            window.location.href = 'success.html';
        },
        error: function (data, status, e) {
            if (status == 'error') {
                alert("error");
            }
        }
    });
}


function getNowFormatDate() {//获取当前时间
	var date = new Date();
	var seperator1 = "-";
	var seperator2 = ":";
	var month = date.getMonth() + 1<10? "0"+(date.getMonth() + 1):date.getMonth() + 1;
	var strDate = date.getDate()<10? "0" + date.getDate():date.getDate();
	var currentdate = date.getFullYear() + seperator1  + month  + seperator1  + strDate
	return currentdate;
}

function editInfo() {
    window.location.href = 'operate.html';
}