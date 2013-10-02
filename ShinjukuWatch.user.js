// ==UserScript==
// @name        ShinjukuWatch
// @namespace   https://github.com/segabito/
// @description 原宿の後継バージョン的な
// @include     http://www.nicovideo.jp/watch/*
// @include     http://www.nicovideo.jp/mylist_add/video/*
// @version     1.0.0
// @grant       none
// ==/UserScript==


// ver1.0.0 最初のバージョン

(function() {
  var monkey = (function(){

    window.Shinjuku = {
    };

    if (!window.WatchApp) {
      if (location.href.indexOf('/mylist_add/video') >= 0) {
        (function() {
        if (window.name === 'nicomylistadd') return;

        var $ = window.jQuery;
        $('body,table,img,td').css({border:0, margin:0, padding:0, background: "transparent", overflow: 'hidden'});
        $('#main_frm').css({background: '#fff', paddig: 0, borderRadius: 0}).addClass('mylistPopupPanel');

        if ($('#edit_description').length < 1) {
          $('#main_frm .font12:first').css({position: 'absolute', margin: 0, top: 0, left: 0, padding: 0, color: 'red', fontSize: '8pt'});
          // ログインしてないぽい
          return;
        }

        $('#box_success').css({position: 'absolute', top: 0, left: 0});
        $('#box_success h1').css({color: 'black', fontSize: '8pt', padding: 0});
        $('td').css({padding: 0});
        $('table:first').css({width: '200px'});
        $('table:first td.main_frm_bg').css({height: '20px'});
        $('table:first table:first').hide();

        $('select')
          .css({width: '100px', height: '20px', position: 'absolute', top: 0, left: 0, margin: 0})
          .addClass('mylistSelect');
        $('select')[0].selectedIndex = $('select')[0].options.length - 1;
        $('#select_group option:last')[0].innerHTML = 'とりあえずマイリスト';

        var submit = document.createElement("input");
        submit.className = 'mylistAdd';
        submit.type  = "submit";
        submit.value = "登録";
        $(submit).css({position: 'absolute', top: '-1px', left: '100px', height: '22px'});
        $('select')[0].parentNode.appendChild(submit);

        $('#edit_description').hide();

        window.document.documentElement.scrollTop  = 0;
        window.document.documentElement.scrollLeft = 0;


        $($.browser.safari ? 'body' : 'html').scrollTop(0);

        window.close = function() {
          return;
        };
        window.alert = function() {
          document.write('<span style="position:absolute;top:0;left:0;font-size:8pt;color:red;">' + arguments[0] + '</span>');
        };
        })();
      }
      return;
    }

    window.WatchApp.mixin(window.Shinjuku, {
      initialize: function() {
        if (window.WatchApp) {
          this.initializeShinjuku();
        }
      },
      initializeShinjuku: function() {
        this._watchInfoModel      = window.WatchApp.ns.init.CommonModelInitializer.watchInfoModel;
        this._playerAreaConnector = window.WatchApp.ns.init.PlayerInitializer.playerAreaConnector;

        this.initializeTag();
        this.initializeNicoru();
        this.initializeVideoExplorer();
        this.initializeNicommend();
        this.initializeIchiba();
        this.initializePlaylist();
        this.initializeQuickMylistFrame();
        this.initializeOther();

        this.initializeCss();
      },
      addStyle: function(styles, id) {
        var elm = document.createElement('style');
        elm.type = 'text/css';
        if (id) { elm.id = id; }

        var text = styles.toString();
        text = document.createTextNode(text);
        elm.appendChild(text);
        var head = document.getElementsByTagName('head');
        head = head[0];
        head.appendChild(elm);
        return elm;
      },
      initializeCss: function() {
        var __css__ = (function() {/*
          {* ニコるを消す *}
          .nicoru-button{
            left: -9999; display: none !important;
          }
          .menuOpened #videoMenuTopList li.videoMenuListNicoru .nicoru-button{
            display: block !important;
          }
          #videoTagContainer .tagInner #videoHeaderTagList li {
            margin: 0 18px 4px 0;
          }

          #videoHeaderDetail h2 {
            letter-spacing: -1px; {* たまに最後の1文字だけ改行されるのを防ぐ *}
          }
          #topVideoInfo .videoDescription{
            border: 1px solid #cccccc;
            border-radius: 4px 4px 4px 4px;
            padding: 4px;
            width: 674px;
            {* max-height: 200px; *}
            overflow-y: auto;
          }
          body.size_normal #topVideoInfo .videoDescription {
            width: 900px;
          }
          #videoTagContainer .tagInner #videoHeaderTagList li .tagControlContainer,
          #videoTagContainer .tagInner #videoHeaderTagList li .tagControlEditContainer {
            padding: 1px 0;
          }
          body:not(.full_with_browser).size_medium #videoTagContainer {
            width: 816px;
          }
          body:not(.full_with_browser).size_normal #videoTagContainer {
            width: 1036px;
          }


          {* 余白の除去 *}
          body #playerContainerWrapper { margin-top: -20px; }
          #videoHeader.menuClosed #videoHeaderDetail {
            margin-top: 0;
          }
          body #videoHeaderDetail.active .videoDetailExpand {
            height: 54px;
            padding: 0;
          }
          #videoTagContainer { height: auto !important; }
          #videoTagContainer .tagInner {
            height: auto !important;
            bottom: 0px;
            position: absolute;
          }
          #videoTagContainer .tagInner #videoHeaderTagList .toggleTagEdit {
            height: auto;
          }
          .videoMenuToggle {
            transform-origin: 100% 100%; -webkit-transform-origin: 100% 100%;
            transform: scale(0.7); -webkit-transform: scale(0.7);
          }
          .videoMenuToggle .tooltipOuter {
            display: none !important;
          }

          #videoExplorerExpand, #playlist, #outline { display: none; }

          #outline .sidebar {
            float: none !important;
            width: auto !important;
            position: relative !important;
            clear: both !important;
          }
          #outline .sidebar>div:not(#playerBottomAd):not(#videoReviewBottomAd) {
            display: none;
          }
          #outline #playerBottomAd {
            float: left: !important;
          }
          #outline #videoReviewBottomAd {
            float: right !important;
            margin-top: 0 !important;
            position: absolute !important;
            top:  auto !important;
            left: auto !important;
            bottom: 0  !important;
            right:  0  !important;
          }


          {* 背景色 *}
          #content { background: #fff; }
          body #playerContainerWrapper { background: none; }

          {* 下半身いっぱいを市場表示 *}
                           #outline .main                   { width: 1008px; }
                           #outline #ichibaMain             { width: 1008px; margin: auto; text-align: center;}
                           #outline .outer                  { width: 1008px; }
          body.size_normal #outline .main                   { width: 1234px; }
          body.size_normal #outline #ichibaMain             { width: 1234px; margin: auto;}
          body.size_normal #outline .outer                  { width: 1234px; }
          body #ichibaMain dl {
            height: 380px; overflow: hidden;
            display: inline-block; float: none;
            text-align: left;
            vertical-align: top;
          }
          body.size_medium #ichibaMain dl {
            margin:0  9px 30px;
          }
          body.size_normal #ichibaMain dl {
            margin:0 10px 30px;
          }
          #outline #ichibaMain .rowJustify { display: none; }
          #outline #ichibaMain #ichibaMainFooter {
            clear: both;
          }
          #footer { z-index: 1;}

          .osusumeContainer {
            position: absolute;
                      top: 8px; right: 8px; bottom: 8px; left: 8px; padding: 4px;
            border: 1px solid #000;
            overflow-y: scroll;
            overflow-x: hidden;
          }
          .panel_ads_shown .osusumeContainer {
            bottom: 0px;
          }
          .osusumeContainer li  {
            margin-bottom: 12px;
            border-bottom: 1px solid #ccc;
            text-align: left;
          }
          .osusumeContainer .thumbnail img {
            float: left; width: 64px; height: 48px;
            margin-right: 4px;
          }
          .osusumeContainer li p  {
            clear: both; font-size: 80%;
            text-align: center;
          }
          .osusumeContainer li .title {
            font-size: 80%;
          }
          .osusumeContainer li .count  {
            font-weight: bolder;
          }
          .osusumeContainer li:after {
            content: ''; clear: both;
          }

          {* ニュース消す *}
          #content.noNews #textMarquee {
            display: none !important;
          }
          body:not(.videoExplorer):not(.setting_panel):not(.full_with_browser) #content.noNews #playerTabWrapper {
            height: auto !important; position: absolute; bottom: 18px;
          }
          body:not(.videoExplorer):not(.setting_panel):not(.full_with_browser) #content.noNews              #playerTabContainer {
            bottom: -17px;
          }
          body:not(.videoExplorer):not(.setting_panel):not(.full_with_browser) #content.noNews .appli_panel #playerTabContainer {
            bottom:  20px;
          }
          #playerTabWrapper.w_videoInfo #playerTabContainer, #playerTabWrapper.w_ichiba #playerTabContainer, #playerTabWrapper.w_review #playerTabContainer {
            bottom: 0px !important;
          }
          body:not(.videoExplorer):not(.setting_panel):not(.full_with_browser) #content.noNews #playerTabWrapper.w_videoInfo,
          body:not(.videoExplorer):not(.setting_panel):not(.full_with_browser) #content.noNews #playerTabWrapper.w_ichiba,
          body:not(.videoExplorer):not(.setting_panel):not(.full_with_browser) #content.noNews #playerTabWrapper.w_review
          {
            height: auto !important; position: absolute; bottom: 2px;
          }
         {* body:not(.videoExplorer):not(.setting_panel):not(.full_with_browser) #content.noNews #leftPanel {
            height: auto !important; position: absolute; bottom: 2px;
          }*}
          body:not(.videoExplorer):not(.setting_panel):not(.full_with_browser) #content.noNews #playerCommentPanel {
            height: 100% !important;
          }
          body:not(.videoExplorer):not(.setting_panel):not(.full_with_browser) #content.noNews #playerContainer.appli_panel #appliPanel {
            bottom: -18px !important;
          }
          body:not(.videoExplorer):not(.setting_panel):not(.full_with_browser) #content.noNews #playerContainer {
            height: auto;
          }

          {* なぜか :hover 使ってなくて見た目バグってるので :hover 使うようにする *}
          body #playerCommentPanel .section .commentTable .commentTableContainer .cell:hover {
            background: #5F5F5F;
          }
          body #playerCommentPanel .section .commentTable .commentTableContainer .cell:hover span {
            color: #fff;
          }
          body #playerCommentPanel .section .commentTable .commentTableContainer .cell.hover {
            background: none;
          }
          body #playerCommentPanel .section .commentTable .commentTableContainer .cell.hover span {
            color: #000;
          }

          .quickMylistFrame.initialize {
            top: -999px;
          }
          .quickMylistFrame {
            position: absolute;
            bottom: 14px;
            right: 45px;
            width: 150px;
            height: 24px;
            border: 0;
          }
          .menuOpened .quickMylistFrame {
            display: none;
          }

          #videoInfo, #nicommendContainer, #videoReview {
            display: none !important;
          }

        */}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1].replace(/\{\*/g, '/*').replace(/\*\}/g, '*/');

        this.addStyle(__css__);
      },
      initializeTag: function() {
        // タグ自動更新キャンセラー
        window.WatchApp.ns.model.player.NicoPlayerConnector.onTagDataRecieved = function() {};

        var $a = $('.toggleTagEditInner a').detach();
        $('.toggleTagEditInner').empty().append($a);
      },
      initializeNicoru: function() {
        // ニコる数を取得するためにコメントパネルがめちゃくちゃ重くなってるのを改善 (Chromeだとあまり変わらない)
        window.WatchApp.ns.model.player.NicoPlayerConnector.getCommentNicoruCount = function() { return 0; };
      },
      initializeVideoExplorer: function() {
        var self = this;
        var explorer   = window.WatchApp.ns.init.VideoExplorerInitializer.videoExplorer;
        var controller = window.WatchApp.ns.init.VideoExplorerInitializer.videoExplorerController;
        var isSearchMode = function() {
          explorer.isOpen();
        };

        controller.showDeflist_org         = controller.showDeflist;
        controller.showMylist_org          = controller.showMylist;
        controller.showOtherUserVideos_org = controller.showOtherUserVideos;
        controller.showOwnerVideo_org      = controller.showOwnerVideo;
        controller.searchVideo_org         = controller.searchVideo;
        controller.showDeflist = $.proxy(function() {
          if (!isSearchMode()) {
            location.href = "/my/mylist";
            return;
          }
          this.showDeflist_org();
        }, controller);
        controller.showMylist = $.proxy(function(id) {
          if (!isSearchMode()) {
            location.href = "/mylist/" + id;
            return;
          }
          this.showMylist_org(id);
        }, controller);
        controller.showOtherUserVideos = $.proxy(function(id, name) {
          if (!isSearchMode()) {
            location.href = "/user/" + id;
            return;
          }
          this.showOtherUserVideos_org(id, name);
        }, controller);
        controller.showOwnerVideo = $.proxy(function() {
          if (!isSearchMode()) {
            location.href = "/user/" + self._watchInfoModel.uploaderInfo.id;
            return;
          }
          this.showOwnerVideo_org();
        }, controller);
        controller.searchVideo = $.proxy(function(word, type) {
          if (!isSearchMode()) {
            location.href = (type === 'tag' ? 'tag' : 'search') + "/" + encodeURIComponent(word);
            return;
          }
          this.searchVideo_org(word, type);
        }, controller);
      },
      initializeNicommend: function() {
        $('#nicommentPanelContainer').empty();
        $('#playerTabContainer .playerTabItem.nicommend').text('オススメ');

        // 終了時にニコメンドが勝手に開かなくするやつ
        // 連続再生中はニコメンドパネルが開かない事を利用する
        //var playerTab = WatchApp.ns.init.PlayerInitializer.playerTab;
        //playerTab.playlist = {
        //  isContinuous: function() {
        //    return true;
        //  }
        //};
      },
      initializePlaylist: function() {
        this.playlistController = {
          _playlist: window.WatchApp.ns.init.PlaylistInitializer.playlist,
          getItems: function() {
            return this._playlist.currentItems.concat();
          },
          clear: function() {
            var x = this.getItems(), items = [], i, currentItem = null;
            for (i = 0; i < x.length; i++) {
              if (x[i]._isPlaying) {
                currentItem = x[i];
                items.unshift(x[i]);
              }
            }
            this.setItems(items, currentItem);
          },
          setItems: function(items, currentItem) {
            var playlist = this._playlist;
            playlist.reset(
              items,
              'Shinjuku',
              playlist.type,
              playlist.option
            );
            if (currentItem) { playlist.playingItem = currentItem; }
            else { playlist.playingItem = items[0]; }
          }
        };

        var items = this.playlistController.getItems();

        // プレイリストを空にする事で、プレーヤー上の「次の動画」「前の動画」ボタンを無効化して誤爆を防ぐことができる
        this.playlistController.clear();


        // オススメタブの表示
        // TODO: 動画が切り替わったらリロード
        var tpl = [
          '<li>',
            '<a href="/watch/%videoId%" class="thumbnail"><img src="%thumbnail%"></a>',
            '<a href="/watch/%videoId%" class="title">%title%</a>',
            '<p>再: <span class="count">%view%</span>',
            'コメ: <span class="count">%num_res%</span>',
            'マイ: <span class="count">%mylist%</span></p>',
          '</li>',
        ''].join('');

        var view = ['<ul>'];
        for (var i = 0, len = Math.min(items.length, 16); i < len; i++) {
          var item = items[i];
          //console.log(JSON.stringify(item));
          if (!item._hasData) continue;
          var itemView = tpl
            .split('%videoId%')  .join(item.id)
            .split('%thumbnail%').join(item.thumbnailUrl)
            .split('%view%')     .join(item.viewCounter)
            .split('%num_res%')  .join(item.numRes)
            .split('%mylist%')   .join(item.mylistCounter)
            .split('%title%')    .join(item.title);
          view.push(itemView);
        }
        view.push('</ul>');
        var $container = $('<div class="osusumeContainer" />').html(view.join(''));
        $('#nicommentPanelContainer').empty().append($container);


      },
      initializeIchiba: function() {
      },
      initializeQuickMylistFrame: function() {
        // ニコニコ動画(RC2) までプレイヤーの右上にあったマイリストメニューを復活させる
        // 昔はマイリスト登録が1クリックだったのにどうしてこうなった？

        var $iframe = $('<iframe class="quickMylistFrame initialize" />'), watchInfoModel = this._watchInfoModel;

        var update = function() {
          var videoId = watchInfoModel.v;
          $iframe[0].contentWindow.location.replace("http://www.nicovideo.jp/mylist_add/video/" + videoId);
        };

        $('#videoHeader').append($iframe);

        update();

        this._playerAreaConnector.addEventListener('onFirstVideoInitialized', $.proxy(function() {
          $iframe.removeClass('initialize');
          watchInfoModel.addEventListener('reset', function() {
            update();
          });
        }, this));
      },
      initializeOther: function() {
        // $('#content').removeClass('panel_ads_shown'); // コメントパネルの広告消すやつ
        $('#content').addClass('noNews');

        var refreshTitle = function() {
          window.setTimeout(function() {
            document.title = document.title.replace(/ニコニコ動画:Q$/, 'ニコニコ動画(新宿)');
          }, 1000);
        };
        refreshTitle();

        this._watchInfoModel.addEventListener('reset', function() {
          refreshTitle();
        });

        this._playerAreaConnector.addEventListener('onVideoEnded', function() {
          // 原宿までと同じように、動画終了時にフルスクリーンを解除したい
          if ($('body').hasClass('full_with_browser')) {
            window.WatchJsApi.player.changePlayerScreenMode('notFull');
          }
        });
        this._playerAreaConnector.addEventListener('onFirstVideoInitialized', function() {
          // プレーヤーの位置に自動スクロール

          if (!$('#videoHeader').hasClass('infoActive')) {
            // ヘッダを閉じてる時はなにもしない
            return;
          }
          var $pc = $('#playerContainer'), $vt = $('#videoTagContainer');
          var h = $pc.outerHeight() + $vt.outerHeight();
          var innerHeight = $(window).height();
          if (innerHeight > h  + 200) {
          // 縦幅に余裕がある時はプレーヤーが画面中央に来るように
            var top = Math.max(($vt.offset().top + h / 2) - innerHeight / 2 + 100, 0);

            $('body, html').animate({scrollTop: top}, 600);
          } else {
            // 縦解像度がタグ+プレイヤーより大きいならタグの開始位置、そうでないならプレイヤーの位置にスクロール
            // ただし、該当部分が画面内に納まっている場合は、勝手にスクロールするとかえってうざいのでなにもしない
            var topElement = innerHeight >= h ? '#videoTagContainer, #playerContainer' : '#playerContainer';
            WatchApp.ns.util.WindowUtil.scrollFitMinimum(topElement, 600);
          }
        });
      }


    });

    window.Shinjuku.initialize();

  });

  var script = document.createElement("script");
  script.id = "SinjukuLoader";
  script.setAttribute("type", "text/javascript");
  script.setAttribute("charset", "UTF-8");
  script.appendChild(document.createTextNode("(" + monkey + ")()"));
  document.body.appendChild(script);

})();



