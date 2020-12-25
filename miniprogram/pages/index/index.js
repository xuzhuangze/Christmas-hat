Page({
  data: {
    userInfo: {},
    ctx: '',
    // bgUrl: '../../static/images/hat/hat01.jpg',
    hat: {
      url: "../../static/images/hat/hat01.jpg",
      w: 40,
      h: 40,
      x: 100,
      y: 100,
      b: 1,//缩放的倍率
      rotate: 0//旋转的角度
    },
    downloadPath: '',
    headPic: '',
    hasUploadHeadpic: 0,
    canvasContext: '',
    hats: [],
    canDrawHat: false,
    headtemppath: '',
    hatInfo: {
      x: 0,//px
      y: 0,//px
      w: 0,//rpx
      h: 0,//rpx
      rotate: 0,//deg
    },
    currentHat: '',
    canMove: false,
  },
  onLoad: function (options) {
    this.setData({ canvasContext: wx.createCanvasContext('canvas') });
    this._getHats();
  },

  // 获取帽子列表
  async _getHats() {
    let res = await wx.cloud.database().collection('hatList').where({ status: 1 }).get();
    if (res.data && res.data.length != 0) {
      this.setData({ hats: res.data });
    }
  },

  _touchCanvas(e) {
    if (e.touches[0].x > this.data.hatInfo.x && e.touches[0].y > this.data.hatInfo.y
      && e.touches[0].x < this.data.hatInfo.x + this.data.hatInfo.w &&
      e.touches[0].y < this.data.hatInfo.y + this.data.hatInfo.h
    ) {
      this.setData({ canMove: true });
    } else {
      this.setData({ canMove: false });
    }
  },

  _moveHat(e) {
    if (this.data.canMove) {
      this._useCanvas(this.data.currentHat, e.touches[0].x - this.data.hatInfo.w / 4, e.touches[0].y - this.data.hatInfo.h / 4, this.data.hatInfo.w, this.data.hatInfo.h, 1, 'move')
    }
  },

  // 放大
  _addSize() {
    if (!this.data.canDrawHat) return
    let { x, y, w, h } = this.data.hatInfo;
    this._useCanvas(this.data.currentHat, x, y, w * 1.2, h * 1.2, 1);
  },
  _reduceSize() {
    if (!this.data.canDrawHat) return
    let { x, y, w, h } = this.data.hatInfo;
    this._useCanvas(this.data.currentHat, x, y, w * 0.8, h * 0.8, 1);
  },
  // 画布
  async _useCanvas(url, x = 0, y = 0, w = 412, h = 412, drawingHat, actionType) {
    let dw = 375;
    await wx.getSystemInfo({
      success(res) {
        dw = res.safeArea.width;
      }
    })
    // 根据屏幕尺寸计算图片的px值
    let rpx = dw / 750;
    let headw = 412 * rpx;
    let headh = 412 * rpx;
    let pw = w * rpx;
    let ph = h * rpx;
    console.log(this.data.headtemppath);
    //每一次必须执行  用头像来覆盖原来的地方
    this.data.canvasContext.beginPath();
    this.data.canvasContext.drawImage(this.data.headtemppath, 0, 0, headw, headh)
    this.data.canvasContext.draw(true, () => {
      this.setData({
        hasUploadHeadpic: 1
      })
    });



    if (drawingHat) {//是否在画帽子
      this.data.canvasContext.beginPath();
      this.data.canvasContext.drawImage(url, x, y, pw, ph)//像素值
      this.data.canvasContext.draw(true, () => {
        if (drawingHat) {
          // 这儿xy是像素值，w，h是rpx;
          this.setData({ hatInfo: { x, y, w, h, rotate: this.data.hatInfo.rotate } });
          // console.log(this.data.hatInfo);
        }
      });
    }
  },



  // 保存结果
  _saveResult() {
    this.data.canvasContext.drawImage('../../static/images/transparent.png', -1, -1, 0, 0)
    this.data.canvasContext.draw(true, () => {
      setTimeout(() => {
        wx.canvasToTempFilePath({
          x: 0, y: 0,
          width: 412,
          height: 412,
          destWidth: 412,
          destHeight: 412,
          canvasId: 'canvas',
          fileType: 'jpg',
          quality: 1,
          success: (res) => {
            if (res.tempFilePath) {
              this.setData({
                downloadPath: res.tempFilePath
              });
              wx.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success() {
                  wx.showToast({ title: '保存成功' })
                }
              })
            }
          },
          fail(res) {
            console.log(res, 'fail');
          }
        })
      }, 1000)
    });
  },

  // 获取头像并调用canvas函数将头像画在画布中
  _getUserInfo(e) {
    console.log(e);
    if (e.detail.userInfo) {
      this.setData({
        userInfo: e.detail.userInfo,
        headPic: e.detail.userInfo.avatarUrl,
      });
      wx.downloadFile({
        url: e.detail.userInfo.avatarUrl,
        success: (result) => {
          // console.log(result.tempFilePath);
          this.setData({ canDrawHat: true, headtemppath: result.tempFilePath })
          this._useCanvas();
          
        }
      })
    } else {
      wx.showToast({
        title: '头像上传失败，请重新上传',
        icon: 'none'
      })
    }
  },

  // 画帽子
  _drawHat(e) {
    if (!this.data.canDrawHat) {
      wx.showToast({
        title: '请上传头像！',
        icon: 'none'
      })
      return
    }
    // this.data.canvasContext.fillStyle = 'transparent';
    wx.getImageInfo({
      src: e.currentTarget.dataset.path,
      success: (res) => {
        this.setData({ currentHat: res.path })
        this._useCanvas(res.path, 60, 0, 200, 200, 1);//参数为头像信息,单位为rpx
      }
    })
  },

})