import { list2map } from '@/utils/common'

export const expressMap = {
  'TRADE_BUYER_SIGNED': '已完成',
  'TRADE_CLOSED': '已关闭',
  'WAIT_SELLER_SEND_GOODS': '待发货',
  'WAIT_BUYER_CONFIRM_GOODS': '已发货',
  'WAIT_BUYER_PAY': '待付款',
  'WAIT_GROUP': '待成团'
}

/**
 * 行业对应关系
 *
 * 我会及时告诉您项目的基本情况的～ 问题：项目位置在哪里/开发商如何/什么时候开盘 2、智能看房 引导语：想看房找我就对啦
 * */
export const industryList = [
  {
    label: '房地产',
    value: '1',
    robotProfession: 'AI销售顾问',
    guideList: [
      {
        label: '项目概况',
        icon: 'iconfont icon-xiangmu',
        type: 'text',
        reply_content: '您可以这样问我喔，我会及时告诉您项目的基本情况的～<br /><a data-type="chat">项目位置在哪里</a><br /><a data-type="chat">开发商如何</a><br /><a data-type="chat">什么时候开盘</a>'
      },
      {
        label: '智能看房',
        icon: 'iconfont icon-fangyuan',
        type: 'text',
        reply_content: '想看房找我就对啦,您可以这样问我～<br /><a data-type="chat">有什么户型</a><br /><a data-type="chat">我想看样板房</a><br /><a data-type="chat">我想买三房</a>'
      },
      {
        label: '活动咨询',
        icon: 'iconfont icon-huodong',
        type: 'text',
        reply_content: '你可以问问我有哪些好玩有趣的活动和购房优惠哦～<br /><a data-type="chat">最近有什么活动</a><br /><a data-type="chat">购房有什么优惠吗</a><br /><a data-type="chat">节日有什么活动</a>'
      },
      {
        label: '周边配套',
        icon: 'iconfont icon-lianjie',
        type: 'text',
        reply_content: '我们的周边配套可丰富啦，您想了解哪方面的情况～<br /><a data-type="chat">周边有那些学校</a><br /><a data-type="chat">公交车有哪些</a><br /><a data-type="chat">附近有什么好玩的景点</a>'
      }
    ],
    commonGuide: [
      {
        label: '索取名片',
        icon: 'iconfont icon-mingpian',
        type: 'businessCard'
      },
      {
        label: '关注公众号',
        icon: 'iconfont icon-gongzhonghao',
        type: 'wechat'
      }
    ],
    salesmanGuide: [
      {
        label: '加我微信',
        icon: 'iconfont icon-weixin',
        type: 'copyWechatNum'
      },
      {
        label: '保存名片',
        icon: 'iconfont icon-iconset0425',
        type: 'saveBusinessCard'
      }
    ]
  },
  {
    label: '电商',
    value: '2',
    robotProfession: 'AI语音助手',
    guideList: [
      {
        label: '购物咨询',
        icon: 'iconfont icon-zixun',
        type: 'text',
        reply_content: '您可以这样问我哦，我会及时帮您找到您想要的东东～<br /><a data-type="chat">你们店里都卖什么啊</a><br /><a data-type="chat">有线下门店吗</a><br /><a data-type="chat">购物有没有发票呢</a>'
      },
      {
        label: '商品导购',
        icon: 'iconfont icon-gouwuche3-copy-copy-copy-copy-copy-copy',
        type: 'text',
        reply_content: '告诉我你想要买的商品名称，我来帮你找一找～<br />我想买xxx<br />有没有xxx'
      },
      {
        label: '优惠咨询',
        icon: 'iconfont icon-hui',
        type: 'text',
        reply_content: '你可以问问我有哪些好玩有趣的活动和购物优惠哦～<br /><a data-type="chat">最近有什么活动</a><br /><a data-type="chat">购物有什么优惠吗</a><br /><a data-type="chat">有什么特价商品吗</a>'
      }
    ],
    commonGuide: [
      {
        label: '关注公众号',
        icon: 'iconfont icon-gongzhonghao',
        type: 'wechat'
      }
    ],
    salesmanGuide: []
  },
  {
    label: '自媒体',
    value: '3'
  },
  {
    label: '商城',
    value: '4',
    robotProfession: 'AI导购助手',
    guideList: [
      {
        label: '购物咨询',
        icon: 'iconfont icon-zixun',
        type: 'text',
        reply_content: '您可以这样问我喔，我会及时帮您找到您想要的东东～<br /><a data-type="chat">有没有火锅店</a><br /><a data-type="chat">星巴克在哪里</a><br /><a data-type="chat">哪里有口红卖啊</a>'
      },
      {
        label: '公共服务',
        icon: 'iconfont icon-fuwu',
        type: 'text',
        reply_content: '有需求找我就对啦,您可以这样问我～<br /><a data-type="chat">洗手间在哪里</a><br /><a data-type="chat">我要开发票</a><br /><a data-type="chat">我想存包包</a>'
      },
      {
        label: '活动咨询',
        icon: 'iconfont icon-huodong',
        type: 'text',
        reply_content: '你可以问问我有哪些好玩有趣的活动和购物优惠哦～<br /><a data-type="chat">最近有什么活动</a><br /><a data-type="chat">会员有什么优惠</a><br /><a data-type="chat">节日有什么活动</a>'
      },
      {
        label: '停车找车',
        icon: 'iconfont icon-tingche',
        type: 'text',
        reply_content: '以后停车和缴费的事啊，说句话就搞定啦～<br /><a data-type="chat">我要交停车费</a><br /><a data-type="chat">我要泊车</a><br /><a data-type="chat">停车费多少钱一小时</a>'
      }
    ],
    commonGuide: [
      {
        label: '关注公众号',
        icon: 'iconfont icon-gongzhonghao',
        type: 'wechat'
      }
    ],
    salesmanGuide: []
  },
  {
    label: '其他',
    value: '5'
  }
]

export const industryMap = list2map(industryList, 'value', 'label')

export const industryInfoMap = list2map(industryList, 'value')
