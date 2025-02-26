/****************************************************************************
 Copyright (c) 2022-2023 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
 worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
 not use Cocos Creator software for developing other software or tools that's
 used for developing games. You are not granted to publish, distribute,
 sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
****************************************************************************/
import nativerender from "libcocos.so";

import { WorkerManager } from '../cocos/WorkerManager'
import { ContextType } from "../common/Constants"
import featureAbility from '@ohos.ability.featureAbility'
import { EditBoxDialog } from '../components/EditBoxDialog'
import { WebViewInfo, CocosWebView } from '../components/CocosWebView'
import { VideoInfo, CocosVideoPlayer } from '../components/CocosVideoPlayer'

import {PortProxy} from '../common/PortProxy'
const nativePageLifecycle = nativerender.getContext(ContextType.JSPAGE_LIFECYCLE);
const engineUtils = nativerender.getContext(ContextType.ENGINE_UTILS);

@Entry
@Component
struct Index {
  @State showMessage: string = ''
  @State webViewArray: WebViewInfo[] = [];
  @State videoArray:VideoInfo[] = [];
  //private index: number = 0;
  private webViewIndexMap: Map<number, number> = new Map;
  private videoIndexMap: Map<number, number> = new Map;
   
  private workPort : PortProxy = new PortProxy(WorkerManager.getInstance().getWorker());
  dialogController: CustomDialogController = new CustomDialogController({
    builder: EditBoxDialog({
      showMessage: this.showMessage,
      onTextChange: (msg: string) => {
        this.showMessage = msg;
        this.workPort.postMessage('onTextInput', msg)
      },
      accept: (msg: string) => {
        this.showMessage = msg;
        this.workPort.postMessage('onComplete', msg)
      },
    }),
    cancel: () => {
      this.workPort.postMessage('onComplete', this.showMessage)
    },
    autoCancel: true,
    alignment: DialogAlignment.Bottom,
    customStyle: true,
  })

  aboutToAppear(): void  {
    console.log('[LIFECYCLE-Index] cocos aboutToAppear');
    this.workPort._messageHandle = (e) => {
      //let data = e['data'];
      var data = e.data;
      var msg = data.data;
      var result;
      switch (msg.name) {
        // EditBox
        case "showEditBox": {
          this.showMessage = msg.param
          this.dialogController.open()
          break;
        }
        case "hideEditBox": {
          this.showMessage = ''
          this.dialogController.close()
          break;
        }
        // WebView
        case "createWebView": {
          this.webViewArray.push(new WebViewInfo(0, 0, 0, 0, msg.param))
          this.webViewIndexMap.set(msg.param, this.webViewArray.length - 1);
          break;
        }
        case "removeWebView": {
          if (this.webViewArray.length > 0) {
            this.webViewArray.splice(this.webViewIndexMap.get(msg.param), 1)
          }
          break;
        }
        case "loadUrl": {
          var web = msg.param;
          var index = this.webViewIndexMap.get(web.tag);
          this.webViewArray[index].controller.loadUrl({url: web.url});
          break;
        }
        case "loadHTMLString": {
          var web = msg.param;
          var index = this.webViewIndexMap.get(web.tag);
          this.webViewArray[index].controller.loadData({data: web.contents, mimeType:"text/html",encoding:"UTF-8", baseUrl:web.baseUrl});
          break;
        }
        case "loadData": {
          var web = msg.param;
          var index = this.webViewIndexMap.get(web.tag);
          this.webViewArray[index].controller.loadData({data: web.contents, mimeType:web.mimeType,encoding:web.encoding, baseUrl:web.baseUrl});
          break;
        }
        case "evaluateJS": {
          var web = msg.param;
          var index = this.webViewIndexMap.get(web.tag)
          this.webViewArray[index].controller.runJavaScript({
            script: web.jsContents
          });
          break;
        }
        case "reload": {
          var index = this.webViewIndexMap.get(msg.param);
          this.webViewArray[index].controller.refresh();
          break;
        }
        case "stopLoading": {
          var index = this.webViewIndexMap.get(msg.param);
          this.webViewArray[index].controller.stop();
          break;
        }
        case "canGoForward": {
          var index = this.webViewIndexMap.get(msg.param);
          result = this.webViewArray[index].controller.accessForward();
          break;
        }
        case "canGoBack": {
          var index = this.webViewIndexMap.get(msg.param);
          result = this.webViewArray[index].controller.accessBackward();
          break;
        }
        case "goForward": {
          var index = this.webViewIndexMap.get(msg.param);
          this.webViewArray[index].controller.forward();
          break;
        }
        case "goBack": {
          var index = this.webViewIndexMap.get(msg.param);
          this.webViewArray[index].controller.backward();
          break;
        }
        case "setWebViewRect": {
          var web = msg.param;
          var index = this.webViewIndexMap.get(web.tag);
          this.webViewArray[index].x = px2vp(web.x);
          this.webViewArray[index].y = px2vp(web.y);
          this.webViewArray[index].w = px2vp(web.w);
          this.webViewArray[index].h = px2vp(web.h);
        }
        case "setVisible":
          var web = msg.param;
          var index = this.webViewIndexMap.get(web.tag);
          this.webViewArray[index].visible = web.visible;
          break;
        // video
        case "createVideo":
          this.videoArray.push(new VideoInfo(0, 0, 0, 0, msg.param))
          this.videoIndexMap.set(msg.param, this.videoArray.length - 1);
          break;
        case "removeVideo":
          if (this.videoArray.length > 0) {
            this.videoArray.splice(this.videoIndexMap.get(msg.param), 1)
          }
          break;
        case "setVideoUrl":
          var video = msg.param;
          var index = this.videoIndexMap.get(video.tag);
          this.videoArray[index].url = video.url;
          break;
        case "setVideoRect": {
          var video = msg.param;
          var index = this.videoIndexMap.get(video.tag);
          this.videoArray[index].x = px2vp(video.x);
          this.videoArray[index].y = px2vp(video.y);
          this.videoArray[index].w = px2vp(video.w);
          this.videoArray[index].h = px2vp(video.h);
          break;
        }
        case "startVideo": {
          var index = this.videoIndexMap.get(msg.param);
          this.videoArray[index].controller.start();
          break;
        }
        case "pauseVideo" : {
          var index = this.videoIndexMap.get(msg.param);
          this.videoArray[index].controller.pause();
          break;
        }
        case "stopVideo" : {
          var index = this.videoIndexMap.get(msg.param);
          this.videoArray[index].controller.stop();
          break;
        }
        case "resumeVideo": {
          var index = this.videoIndexMap.get(msg.param);
          this.videoArray[index].controller.start();
          break;
        }
        case "getVideoDuration": {
          var index = this.videoIndexMap.get(msg.param);
          result = this.videoArray[index].duration;
          break;
        }
        case "seekVideoTo" : {
          var video = msg.param;
          var index = this.videoIndexMap.get(video.tag);
          this.videoArray[index].controller.setCurrentTime(video.time, SeekMode.Accurate);
          break;
        }
        case "setVideoVisible" : {
          var video = msg.param;
          var index = this.videoIndexMap.get(video.tag);
          this.videoArray[index].visible = video.visible;
          break;
        }
        case "setFullScreenEnabled": {
          var video = msg.param;
          var index = this.videoIndexMap.get(video.tag);
          this.videoArray[index].isFullScreen = video.fullScreen;
          break;
        }
        case "currentTime": {
          var index = this.videoIndexMap.get(msg.param);
          result = this.videoArray[index].currentTime;
        }
        default: {

        }
      }
      if (result != null || result != undefined) {
        this.workPort.postReturnMessage(data, result);
      }
    }
  }

  aboutToDisappear(): void {
    console.log('[LIFECYCLE-Index] cocos aboutToDisappear');
//  this.cocosWorker.postMessage({type: "JSPageLifecycle", data: "aboutToAppear"});
//  nativePageLifecycle.aboutToDisappear();
  }

  onPageShow(): void  {
    console.log('[LIFECYCLE-Page] cocos onPageShow');
    nativePageLifecycle.onPageShow();
  }

  onPageHide(): void  {
    console.log('[LIFECYCLE-Page] cocos onPageHide');
    nativePageLifecycle.onPageHide();
  }

  build() {
    Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.Center }) {
      XComponent({ id: 'xcomponentId', type: 'surface', libraryname: 'cocos'})
        .onLoad((context) => {
          // Set the cache directory in the ts layer.
          this.workPort.postMessage("onXCLoad", "XComponent");
        })
        .onDestroy(() => {
          console.log('cocos onDestroy')
        })

        ForEach(this.webViewArray, (item: WebViewInfo, index: number) => {
            CocosWebView({ viewInfo: this.webViewArray[index], workPort: this.workPort})
        }, item => item.viewTag)

        ForEach(this.videoArray, (item: VideoInfo, index: number) => {
          CocosVideoPlayer({ videoInfo: this.videoArray[index], workPort: this.workPort})
        }, item => item.viewTag)
    }
    .width('100%')
    .height('100%')
  }
}
