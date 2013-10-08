// ==UserScript==
// @name        ShinjukuWatch
// @namespace   https://github.com/segabito/
// @description 新しい原宿　略して新宿
// @include     http://www.nicovideo.jp/watch/*
// @include     http://www.nicovideo.jp/mylist_add/video/*
// @version     1.2.1
// @grant       none
// ==/UserScript==

// ver1.2.1
// - マイリストの連続再生から飛んできたときは、プレイリストを消さない

// ver1.2.0
// - GINZA対応

// ver1.1.1
// - レイアウトの崩れを修正
// - WatchItLaterから、背景ダブルクリックで動画の位置にスクロールを移植

// ver1.1.0
// - 動画が切り替わる時にオススメ動画一覧を更新
// - テレビちゃんメニューのスライドをなくした


// ver1.0.0 最初のバージョン

(function() {
  var monkey = (function(){

    window.Shinjuku = {
      ns: {
        loader: {}
      }
    };

    if (!window.WatchApp) {
      if (location.href.indexOf('/mylist_add/video') >= 0) {
        (function() {
        if (window.name === 'nicomylistadd') return;

        var $ = window.jQuery;
        $('body,table,img,td').css({border:0, margin:0, padding:0, background: 'transparent', overflow: 'hidden'});
        $('#main_frm').css({background: 'transparent', paddig: 0, borderRadius: 0}).addClass('mylistPopupPanel');
        $('h1:first').hide();
        $('table').css({marginTop: '100px'});

        if ($('#edit_description').length < 1) {
          $('#main_frm .font12:first').css({position: 'absolute', margin: 0, top: 0, left: 0, bottom: 0, padding: 0, color: 'red', fontSize: '8pt'});
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
          .css({
            position: 'absolute',
            top: 0,
//            right: '50px',
            bottom: 0,
            left: 0,
            fontSize: '11pt',
            border: 0, margin: 0, 'border-radius': '4px 0 0 4px',
            width: '100px'
          })
          .addClass('mylistSelect');
        $('select')[0].selectedIndex = $('select')[0].options.length - 1;
        $('#select_group option:last')[0].innerHTML = 'とりあえずマイリスト';

        var submit = document.createElement("input");
        submit.className = 'mylistAdd';
        submit.type  = "submit";
        submit.value = "登録";
        $(submit)
          .css({
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
//            left: '100px',
            width: '50px',
            fontSize: '10pt',
            margin: 0, 'border-radius': '0 4px 4px 0', 'border-width': '1px',
            cursor: 'pointer'
          });
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

    window.Shinjuku.ns.loader.RelatedVideo = function() { this.initialize.apply(this, arguments); }
    window.Shinjuku.ns.loader.RelatedVideo.prototype = {
      initialize: function() {
      },
      load: function(watchId) {
        var def = new $.Deferred();
        window.WatchApp.ns.init.VideoExplorerInitializer.relatedVideoAPILoader.load(
          {'video_id': watchId},
          function(err, result) {
            if (err !== null) {
              return def.reject({message: '通信に失敗しました(1)', status: 'fail', err: err});
            }
            return def.resolve(result);
          }
        );
        return def.promise();
      }
    };


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
        this.initializeOsusume();
        this.initializePlaylist();
        this.initializeAutoScroll();
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
          {* ページの初期化中に横スクロールバーが出るのがうざい *}
          body:not(.Shinjuku) { overflow-x: hidden; }

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
            width: 662px; {* プレーヤーの幅合わせ *}
            {* max-height: 200px; *}
            overflow-y: auto;
            font-size: 12px;
          }
          body.size_normal #topVideoInfo .videoDescription {
            width: 888px;
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
          body #videoTagContainer .tagInner #videoTagContainerPin.active {
            display: none !important;
          }

          {* 余白の除去 *}
          body:not(.videoExplorer) #playerContainerWrapper { margin-top: -20px; }
          #videoHeader #videoHeaderDetail {
            margin-top: 0 !important;
          }
          #videoHeader .videoDetailExpand { height: auto !important; min-height: 32px;}
          #videoTagContainer { height: auto !important; }
          #videoTagContainer .tagInner {
            height: auto !important;
            bottom: 0px;
            position: absolute;
            min-height: 32px;
          }
          #videoTagContainer .tagInner #videoHeaderTagList .toggleTagEdit {
            height: auto; width: 72px;
          }
          body:not(.full_with_browser) #content #videoTagContainer .tagInner #videoHeaderTagList {
            padding-left: 85px;
          }
          .videoMenuToggle {
            transform-origin: 100% 100%; -webkit-transform-origin: 100% 100%;
            transform: scale(0.7); -webkit-transform: scale(0.7);
          }
          .videoMenuToggle .tooltipOuter {
            display: none !important;
          }
          .videoDetailToggleButton {
            cursor: pointer;
          }
          .toggleDetailExpand, .shortVideoInfo {
            display: none !important;
          }
          #videoDetailInformation .videoMainInfoContainer {
            border-top: none; padding-top: 0; {* 説明文のほうに枠線つけたのでいらなそう *}
          }
          #topVideoInfo .ch_prof, #topVideoInfo .userProfile {
            width: 314px; {* コメントパネルの直線上と合わせる *}
            min-height: 77px;
            border-radius: 4px;
          }
          #topVideoInfo .ch_prof .symbol img, #topVideoInfo .userProfile .usericon{
            width: 64px; height: 64px; margin-top: 5px;
          }
          .userProfile .userIconContainer {
            width: 72px;
          }
          .userProfile .profile {
            width: 242px; margin-top: 5px;
          }
          #topVideoInfo .parentVideoInfo {
            width: 314px;
            border-radius: 4px;
          }
          body.channel .ch_prof .info {
            padding-left: 74px;
          }
          {* ソーシャル関連リンクをコメントパネル幅に合わせる *}
          ul.socialLinks li.socialLinkTwitter  { width: 108px; }
          ul.socialLinks li.socialLinkGoogle   { width:  63px; }
          ul.socialLinks li.socialLinkFacebook { width: 106px; }


          #content #topVideoInfo .videoMainInfoContainer{
            padding: 0;
          }
          #content #videoDetailInformation{
            border-top: 0;
          }
          #content .videoInformation{
            margin: -4px 0 ;
          }
          #content #topVideoInfo .videoStats {
            margin-bottom: 2px;
          }

          body:not(.videoExplorer) #videoExplorerExpand, #outline { display: none; }
          body:not(.full_with_browser):not(.videoExplorer) #content:not(.s_showPlaylist) #playlist{
            position: absolute; top: -9999px;
          }
          body:not(.full_with_browser):not(.videoExplorer) #playlist {
            margin: -10px auto 0; width: 1008px;
          }
          body:not(.full_with_browser):not(.videoExplorer).size_normal #playlist {
            width: 1234px;
          }
          #videoHeaderMenu .searchContainer { margin-top: -2px; padding: 0 5px; right: -3px; }

          #outline .sidebar {
            float: none !important;
            width: auto !important;
            position: relative !important;
            clear: both !important;
            height: 256px;
          }
          #outline .sidebar>div:not(#playerBottomAd):not(#videoReviewBottomAd) {
            display: none;
          }
          #outline #playerBottomAd, #outline #videoReviewBottomAd {
            position: absolute !important;

            overflow: hidden;
            width: 300px !important; height: 256px !important;
            top:    auto !important;
            bottom:    0 !important;
            margin: 0 !important;
          }
          #outline #playerBottomAd {
            left:  0    !important;
            right: auto !important;
          }
          #outline #videoReviewBottomAd {
            left:  auto !important;
            right:    0 !important;
          }


          {* 背景色 *}
          body, #outline { background: #f4f4f4; transition: background 1s ease 1s; }
          body.Shinjuku,.Shinjuku #outline { background: #fff; }
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
          #ichibaMain #ichibaMainFooter .commandArea2 {
            display: none; {* 変な位置に表示されてみっともないので *}
          }
          body.size_medium #ichibaMain dl {
            margin:0  9px 30px;
          }
          body.size_normal #ichibaMain dl {
            margin:0 10px 30px;
          }
          body #ichibaMain dt {
            height: 60px;
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
            margin-bottom: 8px;
            padding: 4px;
            border-bottom: 1px solid #ccc;
            text-align: left;
          }
          .osusumeContainer li a:visited {
            color: purple;
          }

          .osusumeContainer .currentVideoRelated {
            background: #fff;
            font-weight: bolder;
          }

          .osusumeContainer .previousOsusume {
            margin-top: 64px;
            background: #ccc;
          }

          .osusumeContainer .thumbnail img {
            float: left; width: 64px; height: 48px;
            margin-right: 4px;
          }
          .osusumeContainer li p  {
            clear: both; font-size: 80%;
            text-align: center;
          }
          .osusumeContainer li .posted {
            display: block;
            font-size: 80%;
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

          {* テレビちゃんメニュー スライドをやめる *}
          body #videoHeader #videoMenuWrapper{
            position: absolute; width: 324px; height: auto !important;
            opacity: 0;
            transition: opacity 0.4s ease;
            right: 0px;
          }
          body #videoHeader.menuOpened #videoMenuWrapper{
            z-index: 1000 !important;
            border: 1px solid #000;
            background: white;
            box-shadow: 0px 0px 4px #000;
            top: 98px;
            bottom: auto;
            opacity: 1;
          }
          body #videoHeader.infoActive.menuOpened #videoMenuWrapper{
            top: auto;
            bottom: 48px;
          }
          body #videoHeader #videoMenuWrapper .defmylistButton, body #videoHeader #videoMenuWrapper .mylistButton {
            display: none !important;
          }
          body #videoHeader #videoMenuTopList{
            position: relative;
            width: auto;
          }
          body #videoHeader.menuOpened #videoMenuWrapper .videoMenuList{
            display: inline-block;
            width: 60px;
          }

          {* テレビちゃんメニューのスライド殺す *}
          body #videoHeader.menuOpened #videoMenuWrapper {
            margin-bottom: 0;
          }
          body #videoHeader.menuOpened #videoHeaderDetail {
            margin-top: 0px;
          }

          body.Shinjuku:not(.videoExplorer):not(.setting_panel):not(.full_with_browser)    #content.noNews              #playerTabWrapper {
            height: auto !important; position: absolute;
          }
          body.size_medium:not(.videoExplorer):not(.setting_panel):not(.full_with_browser) #content.noNews              #playerTabWrapper {
            bottom: -33px;
          }
          body.size_medium:not(.videoExplorer):not(.setting_panel):not(.full_with_browser) #content.noNews .appli_panel #playerTabWrapper {
            bottom:  19px;
          }
          body.size_normal:not(.videoExplorer):not(.setting_panel):not(.full_with_browser) #content.noNews              #playerTabWrapper {
            bottom: 0px;
          }
          body.size_normal:not(.videoExplorer):not(.setting_panel):not(.full_with_browser) #content.noNews .appli_panel #playerTabWrapper {
            bottom: 18px;
          }
          body.size_medium:not(.videoExplorer):not(.setting_panel):not(.full_with_browser) #content.noNews #playerAlignmentArea              #playerTabContainer {
            bottom: 33px;
          }
          body.size_medium:not(.videoExplorer):not(.setting_panel):not(.full_with_browser) #content.noNews #playerAlignmentArea .appli_panel #playerTabContainer {
            bottom: 19px;
          }
          body.size_normal:not(.videoExplorer):not(.setting_panel):not(.full_with_browser) #content.noNews #playerAlignmentArea              #playerTabContainer {
            bottom:  0px;
          }
          body.size_normal:not(.videoExplorer):not(.setting_panel):not(.full_with_browser) #content.noNews #playerAlignmentArea .appli_panel #playerTabContainer {
            bottom: 19px;
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
          body:not(.videoExplorer):not(.setting_panel):not(.full_with_browser) #content.noNews #playerCommentPanel {
            height: 100% !important;
          }
          body:not(.videoExplorer):not(.setting_panel):not(.full_with_browser) #content.noNews #playerContainer.appli_panel #appliPanel {
            bottom: -18px !important;
          }
          body:not(.videoExplorer):not(.setting_panel):not(.full_with_browser) #content.noNews #playerContainer {
            height: auto;
          }

          .quickMylistFrame.initialize {
            top: -999px;
          }
          .quickMylistFrame {
            position: absolute;
            bottom: 13px;
            right: 44px;
            width: 150px;
            height: 21px;
            border: 0;
            background: #444;
            border-radius: 4px;
            padding: 9px 4px;
          }

          #videoInfo, #nicommendContainer, #videoReview {
            display: none !important;
          }

          #playerAlignmentArea .playerBottomButton {
            display: none;
          }
          body:not(.videoExplorer):not(.full_with_browser).Shinjuku #playerAlignmentArea .playerBottomButton {
            display: block;
          }

          #playerAlignmentArea .playerBottomButton {
            position: absolute;
            bottom: -20px;
            height: 28px;
            border: 1px outset #888;
            border-radius: 0 0 8px 8px;
            cursor: pointer;
            color: #333;
            transition: box-shadow 0.4s ease-out;
            background: #fff;
          }
          #playerAlignmentArea .playerBottomButton:hover {
            box-shadow: 1px 1px 1px #888;
            bottom: -25px;
          }
          #content.s_showPlaylist #playerAlignmentArea .playerBottomButton {
            bottom: -185px;
          }
          #content.s_showPlaylist #playerAlignmentArea .playerBottomButton:hover {
            bottom: -190px;
          }

          #playerAlignmentArea .playerBottomButton:after {
            content: ' ▼';
          }
          #content.s_showPlaylist #playerAlignmentArea .togglePlaylist:after {
            content: ' ▲';
          }

          #playerAlignmentArea .openVideoExplorer {
            left: 120px;
            width: 64px;
          }
          #playerAlignmentArea .togglePlaylist {
            left: 0px;
            width: 120px;
          }


          #wallImageContainer, #content.w_flat_white #wallImageContainer,
          #chipWallList,       #content.w_flat_white #chipWallList  {
          }
          {* なんで左に移動するのか？ それは、このアイコンのせいで横スクロールバーが出るのが嫌だから *}
          #content #chipWallList {
            right: auto; left: -42px;
          }
          {* harajuku_whiteって言ってるけどどう見てもq_white です。 *}
          .Shinjuku .wallAlignmentArea img[src$="harajuku_white.png"] {
            display: none !important;
          }
          .wallAlignmentArea.image2 {
            display: none !important;
          }
          body:not(.videoExplorer):not(.full_with_browser) #content #playerContainer {
            min-height: 461px;
          }
          body #wallImageContainer {
            bottom: 10px;
            top: 10px;
            height: auto;
          }

        */}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1].replace(/\{\*/g, '/*').replace(/\*\}/g, '*/');

        this.addStyle(__css__);
      },
      initializeTag: function() {
        // タグ自動更新キャンセラー
        window.WatchApp.ns.model.player.NicoPlayerConnector.onTagDataRecieved = function() {};

        // タグ領域のピン留め
        window.WatchApp.ns.init.TagInitializer.tagViewController.tagViewPinStatus.changeStatus(true);

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
          return explorer.isOpen();
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

        var $openVideoExplorer = $('<button class="openVideoExplorer playerBottomButton">検索</botton>');
        $openVideoExplorer.on('click', function(e) {
          e.stopPropagation(); e.preventDefault();
          explorer.openByCurrentCondition();
        });
        $('#playerAlignmentArea').append($openVideoExplorer);
        $openVideoExplorer = null;
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
      initializeOsusume: function() {
        // 動画が切り替わるたびに関連動画(オススメ)をリロードする
        // でもYouTubeみたいに中身が全部入れ替わる方式だと「他に見たい奴もあったのに」を回収できなくて嫌
        // なので、n件までたまっていく方式にする
        var template = [
          '<li class="%class%">',
            '<a href="/watch/%videoId%" class="thumbnail"><img src="%thumbnail%"></a>',
            '%posted%',
            '<a href="/watch/%videoId%" class="title">%title%</a>',
            '<p>再: <span class="count">%view%</span>',
            'コメ: <span class="count">%num_res%</span>',
            'マイ: <span class="count">%mylist%</span></p>',
          '</li>',
        ''].join('');
        var relatedVideo   = new window.Shinjuku.ns.loader.RelatedVideo({});
        var watchInfoModel = this._watchInfoModel;
        var MAX_ITEMS = 100;

        var osusumeController = this.osusumeController = {
          items: [],
          $container: $('<div class="osusumeContainer" />'),
          initialize: function() {
            $('#nicommentPanelContainer').empty().append(this.$container);
            this.$container.on('dblclick', function() {
              $(this).animate({scrollTop: 0}, 400);
            });
          },
          add: function(item) {
            item.baseId = watchInfoModel.v; // どの動画の関連だったか
            this.items.unshift(item);
            this.items.length = Math.min(this.items.length, 150);
          },
          addPlaylistItem: function(item) {
            if (!item._hasData) return;
            this.add({
              id:             item.id,
              first_retrieve: item.firstRetrieve,
              thumbnail_url:  item.thumbnailUrl,
              num_res:        item.numRes,
              mylist_counter: item.mylistCounter,
              view_counter:   item.viewCounter,
              title:          item.title
            });
          },
          refresh: function() {
            var uniq = {}, count = 0, items = this.items;
            var watchId = watchInfoModel.v;

            var view = ['<ul>'];
            for (var i = 0, len = items.length; i < len; i++) {
              var item = items[i], id = item.id;

              if (uniq[id] || watchId === id) continue;
              uniq[id] = true;
              if (++count > MAX_ITEMS) break;
              var itemView = template
                .split('%videoId%')  .join(item.id)
                .split('%thumbnail%').join(item.thumbnail_url)
                .split('%view%')     .join(item.view_counter)
                .split('%num_res%')  .join(item.num_res)
                .split('%mylist%')   .join(item.mylist_counter)
                .split('%title%')    .join(item.title)
                .split('%posted%')   .join(
                    typeof item.first_retrieve === 'string' ?
                      '<span class="posted">' + item.first_retrieve.replace(/(\d+)-/g, '$1/') + ' 投稿</span>' :
                      ''
                )
                .split('%class%')    .join(item.baseId === watchId ? 'currentVideoRelated' : 'otherVideoRelated');
              view.push(itemView);
            }
            view.push('</ul>');

            this.$container
              .html(view.join(''))
              .scrollTop(0)
              .find('.otherVideoRelated:first')
              .addClass('first')
              .before($('<li class="previousOsusume">前の動画のオススメ</li>'));
          }
        };

        osusumeController.initialize();

        var update = function() {
          relatedVideo.load(watchInfoModel.v).pipe(function(result) {
            var items = result.list;
            for (var i = items.length - 1; i >= 0; i--) {
              if (items[i].type === 0 /* video */) osusumeController.add(items[i]);
            }
            osusumeController.refresh();
          });
        };

        // 再生開始時にタブがコメントに変わるのはザッピングに邪魔なので切る
        window.WatchApp.ns.init.PlayerInitializer.playerTab.playerAreaConnector.removeEventListener(
          'onVideoStarted',
          window.WatchApp.ns.init.PlayerInitializer.playerTab._onVideoStarted);
        window.WatchApp.ns.init.PlayerInitializer.playerTab.playerAreaConnector.removeEventListener(
          'onVideoEnded',
          window.WatchApp.ns.init.PlayerInitializer.playerTab._onVideoEnded);


        this._playerAreaConnector.addEventListener('onFirstVideoInitialized', $.proxy(function() {
          watchInfoModel.addEventListener('reset', function() {
            update();
          });
        }, this));
      },
      initializePlaylist: function() {
        this.playlistController = {
          _playlist: window.WatchApp.ns.init.PlaylistInitializer.playlist,
          isContinuous: function() { // 連続再生中か？
            return this._playlist.isContinuous();
          },
          toggle: function(v) {
            if (typeof v === 'boolean') {
              $('#content').toggleClass('s_showPlaylist', v);
            } else {
              $('#content').toggleClass('s_showPlaylist');
            }
          },
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

        if (location.href.indexOf('mylist_mode=playlist') >= 0) {
          // マイリストページなどから「連続再生」で飛んできた場合はプレイリストを消さない
          this.playlistController.toggle(true);
        } else {
          // プレイリストを空にする事で、プレーヤー上の「次の動画」「前の動画」ボタンを無効化して誤爆を防ぐことができる
          this.playlistController.clear();
        }

        // 通信回数を減らすため、
        // 動画ページを開いた初回だけはrelatedVideoAPIではなく、プレイリストにあった動画をオススメにつっこむ。
        // 投稿日時が取得できないのが難点
        if (items.length > 0) {
          for (var i = items.length - 1; i >= 0; i--) {
            this.osusumeController.addPlaylistItem(items[i]);
          }
          this.osusumeController.refresh();
        }

        var $togglePlaylist = $('<button class="togglePlaylist playerBottomButton">プレイリスト</botton>');
        $togglePlaylist.on('click', $.proxy(function(e) {
          e.stopPropagation(); e.preventDefault();
          this.playlistController.toggle();
        }, this));
        $('#playerAlignmentArea').append($togglePlaylist);
        $togglePlaylist = null;

      },
      initializeIchiba: function() {
      },
      initializeAutoScroll: function() {
        // プレーヤーの位置に自動スクロール
        var scrollToPlayer = function() {
          var $pc = $('#playerContainer'), $vt = $('#videoTagContainer');
          var h = $pc.outerHeight() + $vt.outerHeight();
          var innerHeight = $(window).height();
          if (innerHeight > h  + 200) {
          // 縦幅に余裕がある時はプレーヤーが画面中央に来るように
            var top = Math.max(($vt.offset().top + h / 2) - innerHeight / 2, 0);

            $('body, html').animate({scrollTop: top}, 600);
          } else {
            // 縦解像度がタグ+プレイヤーより大きいならタグの開始位置、そうでないならプレイヤーの位置にスクロール
            // ただし、該当部分が画面内に納まっている場合は、勝手にスクロールするとかえってうざいのでなにもしない
            var topElement = innerHeight >= h ? '#videoTagContainer, #playerContainer' : '#playerContainer';
            WatchApp.ns.util.WindowUtil.scrollFitMinimum(topElement, 600);
          }
        };

        this._playerAreaConnector.addEventListener('onFirstVideoInitialized', function() {
          if (!$('#videoHeader').hasClass('infoActive')) {
            // ヘッダを閉じてる時はなにもしない
            return;
          }
          scrollToPlayer();
        });

        $('html').on('dblclick', function(e) {
          var $target = $(e.target);
          if ($target.hasClass('videoDescription')) return;
          scrollToPlayer();
        });
      },
      initializeQuickMylistFrame: function() {
        // ニコニコ動画(RC2) までプレイヤーの右上にあったマイリストメニューを復活させる
        // 昔はマイリスト登録が1クリックだったのにどうしてこうなった？

        var $iframe = $('<iframe class="quickMylistFrame initialize" />'), watchInfoModel = this._watchInfoModel;

        var update = function() {
          var videoId = watchInfoModel.v;
          $iframe[0].contentWindow.location.replace("/mylist_add/video/" + videoId);
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
        $('.videoDetailExpand h2').addClass('videoDetailToggleButton');

        // ヘッダとコンテンツツリーの位置を入れ替える お気に入り登録ボタンが効かなくなる模様
        //$('.userProfile:first').after($('.parentVideoInfo:first').detach());
        //$('.hiddenUserProfile').after($('.userProfile:first').detach());

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
          $('body').addClass('Shinjuku');
        });
      }


    });

    window.Shinjuku.initialize();

  });

  var script = document.createElement("script");
  script.id = "ShinjukuLoader";
  script.setAttribute("type", "text/javascript");
  script.setAttribute("charset", "UTF-8");
  script.appendChild(document.createTextNode("(" + monkey + ")()"));
  document.body.appendChild(script);

})();
