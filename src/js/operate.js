function LoadNewsTable() {
    $.ajax({
        url: 'https://lsservice.leicacloud.com:1201/api/news?type=1',
        type: 'GET',
        dataType: "json",
        contentType: "application/json;utf-8",
        success: function (data) {
            console.log(data);
            if (data.length > 0) {
                var tbody = document.getElementById('tbody');
                var childs = tbody.childNodes;
                var count = childs.length;
                for (var i = count - 1; i >= 0; i--) {//清空列表
                    tbody.removeChild(childs[i]);
                }
                for (var i = 0; i < data.length; i++) { //遍历一下json数据 
                    var trow = getDataRow(data[i]); //定义一个方法,返回tr数据 
                    tbody.appendChild(trow);
                }
            } else {
                var tbody = document.getElementById('tbody');
                var childs = tbody.childNodes;
                var count = childs.length;
                for (var i = count - 1; i >= 0; i--) {//清空列表
                    tbody.removeChild(childs[i]);
                }
                for (var i = 0; i < per.length; i++) { //遍历一下json数据 
                    var trow = getDataRow(per[i]); //定义一个方法,返回tr数据 
                    tbody.appendChild(trow);
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

function LoadIndustryNewsTable() {
    $.ajax({
        url: 'https://lsservice.leicacloud.com:1201/api/news?type=2',
        type: 'GET',
        dataType: "json",
        contentType: "application/json;utf-8",
        success: function (data) {
            console.log(data);
            if (data.length > 0) {
                var tbody = document.getElementById('tbody');
                var childs = tbody.childNodes;
                var count = childs.length;
                for (var i = count - 1; i >= 0; i--) {//清空列表
                    tbody.removeChild(childs[i]);
                }
                for (var i = 0; i < data.length; i++) { //遍历一下json数据 
                    var trow = getDataRow(data[i]); //定义一个方法,返回tr数据 
                    tbody.appendChild(trow);
                }
            } else {
                var tbody = document.getElementById('tbody');
                var childs = tbody.childNodes;
                var count = childs.length;
                for (var i = count - 1; i >= 0; i--) {//清空列表
                    tbody.removeChild(childs[i]);
                }
                for (var i = 0; i < per.length; i++) { //遍历一下json数据 
                    var trow = getDataRow(per[i]); //定义一个方法,返回tr数据 
                    tbody.appendChild(trow);
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

function getDataRow(h) {
    var row = document.createElement('tr'); //创建行 
    var idCell = document.createElement('td');//创建第1列name 
    idCell.innerHTML = h.resourceid;
    idCell.setAttribute('style', 'width:99px');
    row.appendChild(idCell);
    var titleCell = document.createElement('td');//创建第2列creater
    titleCell.innerHTML = h.title;
    titleCell.setAttribute('style', 'width:252px');
    row.appendChild(titleCell);
    var dateCell = document.createElement('td');//创建第2列creater
    dateCell.innerHTML = h.date;
    dateCell.setAttribute('style', 'width:100px');
    row.appendChild(dateCell);
    //到这里，json中的数据已经添加到表格中，下面为每行末尾添加操作按钮 
    var reviewCell = document.createElement('td');//创建第3列，操作列 
    reviewCell.setAttribute('style', 'width:160px');
    row.appendChild(reviewCell);
    var btnDelete = document.createElement('input'); //创建一个input控件 
    btnDelete.setAttribute('type', 'button'); //type="button" 
    btnDelete.setAttribute('value', '删除');
    btnDelete.onclick = function () {
        if (confirm("确定删除该条新闻吗？")) {
            $.ajax({
                url: 'https://lsservice.leicacloud.com:1201/api/AddNews/leicaNews?resourceid='+h.resourceid,
                type: 'GET',
                dataType: "json",
                contentType: "application/json;utf-8",
                success: function (data) {
                    console.log(data);
                    if(data["Status"]==0) {
                        alert(data["Msg"]);
                    } else {
                        alert(data["Msg"]); 
                    }
                },
                error: function (data, status, e) {
                        alert("error");
                }
            });
            //找到按钮所在行的节点，然后删掉这一行 
            this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
        }
    }
    var btnEdit = document.createElement('input'); //创建一个input控件 
    btnEdit.setAttribute('type', 'button'); //type="button" 
    btnEdit.setAttribute('value', '修改');
    btnEdit.onclick = function () {//审核操作 
        if (confirm("确定修改该条新闻吗？")) {
            window.location.href = "edit.html?id="+h.resourceid;
        }
    }
    reviewCell.appendChild(btnDelete);
    reviewCell.appendChild(btnEdit); //把审核按钮加入td
    return row; //返回tr数据   
}

$(function(){
    $('#tabs a').click(function(e) {
         e.preventDefault();                
         $('#tabs li').removeClass("current").removeClass("hoverItem");
         $(this).parent().addClass("current");
         $("#content div").removeClass("show");
         $('#' + $(this).attr('title')).addClass('show');
         if($(this).attr('title')=="tab1"){  
            LoadNewsTable(); 
         }
         if($(this).attr('title')=="tab2"){ 
            LoadIndustryNewsTable();
         } 
     });
    $('#tabs a').hover(function(){
       if(!$(this).parent().hasClass("current")){
         $(this).parent().addClass("hoverItem");
       }
    },function(){
       $(this).parent().removeClass("hoverItem");
    });
 });

 function add() {
    window.location.href = 'Submit.html';
 }