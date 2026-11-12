<template>
    <view class="service-page">
        <uv-navbar :border="false" title="服务协议" :autoBack="false" placeholder safeAreaInsetTop @leftClick="handleNavBack"></uv-navbar>
        <view class="content">
            <view class="title">{{ getWxAppName() }}注册服务条款</view>

            <view class="note">
                注：本条款是用户与<text class="green">{{ getCompanyName() }}</text>旗下"<text class="green">{{ getWxAppName() }}</text>"之间的协议。版本发布日期为<text class="bold">2025 年 12月 1 日</text>，生效日期为<text class="bold">2025 年 12月 1 日</text>。
            </view>

            <view class="section">
                <view class="section-title">一、重要须知</view>
                <view class="section-content">
                    <view class="content-item">
                        1、<text class="green">{{ getCompanyName() }}</text>在此特别提醒，用户在注册、使用"<text class="green">{{ getWxAppName() }}（Android &IOS）</text>"之前，请认真阅读本服务条款中的各项条款说明。通过进入注册程序并勾选"我同意<text class="green">{{ getWxAppName() }}</text>注册服务条款"，即表示用户与<text class="green">{{ getCompanyName() }}</text>已达成协议，自愿接受本服务条款的所有内容（未成年人审阅时应得到法定监护人的陪同）；
                    </view>
                    <view class="content-item">
                        2、"<text class="green">{{ getWxAppName() }}</text>"有权在必要时修改本服务条款，请用户随时关注APP服务条款的修改。如果用户不同意所改动的内容，可以主动停止使用"<text class="green">{{ getWxAppName() }}</text>"提供的相关服务，并可注销此APP。
                    </view>
                    <view class="content-item">
                        3、客户一旦成功注册成为会员，将有一个独立的密码和用户名，并可以随时修改自己的密码；用户将对用户名和密码的安全及其用户名进行的所有活动和事件负全部责任。用户若发现本账号被非法使用或存在安全漏洞的情况，请立即通告本公司。否则，一切责任和后果由用户本人承担。
                    </view>
                </view>
            </view>

            <view class="section">
                <view class="section-title">二、服务简介</view>
                <view class="section-content">
                    <view class="content-item">
                        1、"<text class="green">{{ getWxAppName() }}</text>"分为Android和IOS两个版本，可以实现个人电动车主充电导航、扫码充电、支付、订单管理、分享等功能，用户注册成为会员后，即可享受APP提供的任何服务；
                    </view>
                    <view class="content-item">
                        2、APP钱包首次最低充值金额为10元人民币，目前支持微信或支付宝两种支付方式；
                    </view>
                </view>
            </view>

            <view class="section">
                <view class="section-title">三、用户同意</view>
                <view class="section-content">
                    <view class="content-item">1、提供及时、详尽及准确的个人资料，并不断更新注册资料、符合及时、详尽、准确的要求；</view>
                    <view class="content-item">2、不使用APP服务作非法用途和不道德行为；</view>
                    <view class="content-item">3、遵守中国有关法律法规的规定；</view>
                    <view class="content-item">4、本APP内的所有文字、软件、图像等其它信息受版权、商标、标签和其它财产所有权法律的保护，用户不能擅自复制、再造这些内容、或创造与内容有关的派生产品。</view>
                </view>
            </view>

            <view class="section">
                <view class="section-title">四、用户个人信息保护及授权</view>
                <view class="section-content">
                    <view class="content-item">
                        1、用户知悉并同意，为方便用户使用本网站相关服务，本网站将存储用户在使用时的必要信息，包括但不限于用户的真实姓名、性别、生日、联系方式、通讯录、相册、日历、定位信息等。除法律法规规定的情形外，未经用户的许可本公司不会向第三方公开、透露用户的个人信息，但因下列原因而披露给第三方的除外，本公司对相关信息采取专业加密存储与传输方式，利用合理措施保障用户个人信息的安全，亦会要求合作方保护用户的个人信息安全：
                    </view>
                    <view class="sub-list">
                        <view class="sub-item">a)基于国家法律法规的规定而对外披露；</view>
                        <view class="sub-item">b)应国家司法机关及其他有关机关基于法定程序的要求而披露；</view>
                        <view class="sub-item">c)为保护"{{ getWxAppName() }}"用户的合法权益而披露；</view>
                        <view class="sub-item">d)在紧急情况下，为保护其他用户及第三方人身安全而披露；</view>
                        <view class="sub-item">e)用户本人或用户监护人授权披露的；</view>
                        <view class="sub-item">f)因向用户提供服务所必须，而将信息提供给充电运营合作方的。</view>
                    </view>
                    <view class="content-item">
                        2、用户知悉并确认，用户在注册帐号或使用本网站的过程中，需要提供真实的身份信息，本公司将根据国家法律法规相关要求，进行基于移动电话号码的真实身份信息认证。若用户提供的信息不真实、不完整，则无法使用本网站或在使用过程中受到限制，同时，由此产生的不利后果，由用户自行承担。
                    </view>
                    <view class="content-item">
                        3、用户在使用本网站某一特定服务时，该服务可能会另有单独的协议、相关业务规则等（以下统称为"单独协议"），用户在使用该项服务前请阅读并同意相关的单独协议；用户使用前述特定服务，即视为用户已阅读并同意接受相关单独协议。
                    </view>
                    <view class="content-item">4、用户充分理解并同意：</view>
                    <view class="sub-list">
                        <view class="sub-item">a) 接收通过邮件、短信、电话等形式，向在本网站注册、购买服务的用户发送的订单信息、促销活动等内容；</view>
                        <view class="sub-item">
                            b) 为配合行政监管机关、司法机关执行工作，在法律规定范围内本公司有权向上述行政、司法机关提供用户在使用本网站时所储存的相关信息，包括但不限于用户的注册信息等，或使用相关信息进行证据保全，包括但不限于公证、见证等；
                        </view>
                        <view class="sub-item">
                            c)本公司依法保障用户在安装或使用过程中的知情权和选择权，在用户使用本网站服务过程中，涉及用户设备自带功能的服务会提前征得用户同意，用户一经确认，巨湾有权开启包括但不限于收集地理位置、读取通讯录、使用摄像头、启用录音等提供服务必要的辅助功能；
                        </view>
                        <view class="sub-item">
                            d)本公司有权根据实际情况，在法律规定范围内自行决定单个用户在本网站及服务中数据的最长储存期限以及用户日志的储存期限，并在服务器上为其分配数据最大存储空间等。
                        </view>
                    </view>
                </view>
            </view>

            <view class="section">
                <view class="section-title">五、用户行为规范</view>
                <view class="section-content">
                    <view class="content-item bold">1、您同意严格遵守法律法规规章规定，依法遵守以下义务：</view>
                    <view class="sub-list">
                        <view class="sub-item">
                            a).<text class="bold">不得制作、传输或发表以下违法信息资料：</text>反对宪法所确定的基本原则，煽动抗拒、破坏宪法和法律法规实施的；危害国家安全，泄露国家秘密，颠覆国家政权，破坏国家统一的，煽动推翻社会主义制度的；损害国家荣誉和利益的；歪曲、丑化、亵渎、否定英雄烈士事迹和精神，侵害英雄烈士的姓名、肖像、名誉、荣誉的；宣扬或煽动实施恐怖主义、极端主义及其活动的；煽动民族仇恨、民族歧视、破坏民族团结的言论；破坏国家宗教政策，宣扬邪教和封建迷信的；散布谣言，扰乱经济秩序和社会秩序的；散布淫秽、色情、暴力或者教唆犯罪的；侮辱或者诽谤他人，侵害他人名誉、隐私和其他合法权益的；法律、行政法规禁止的其他内容。
                        </view>
                        <view class="sub-item">
                            b).<text class="bold">防范和抵制制作、复制、发布含有下列内容的不良信息资料：</text>标题严重夸张，发表内容与标题严重不符的；不当评述自然灾害、重大事故等灾难的；煽动人群歧视、地域歧视等的；宣扬低俗、庸俗、媚俗内容的；违反社会公德行为的；侵犯未成年人合法权益的；其他对网络生态造成不良影响的内容。
                        </view>
                    </view>
                    <view class="content-item bold">2、本协议依据国家相关法律法规规章制定，您亦同意严格遵守以下义务：</view>
                    <view class="sub-list">
                        <view class="sub-item">a). 从中国大陆向境外传输资料信息时必须符合中国有关法规；</view>
                        <view class="sub-item">b). 不得利用本网站从事洗钱、窃取商业秘密、窃取个人信息等违法犯罪活动；</view>
                        <view class="sub-item">c). 不得干扰本网站的正常运转，不得侵入本网站及国家计算机信息系统；</view>
                        <view class="sub-item">d). 不得传输或发表任何违法犯罪的、骚扰性的、中伤他人的、辱骂性的、恐吓性的、伤害性的、庸俗的、不文明的等信息资料；</view>
                        <view class="sub-item">e). 不得教唆他人从事违法违规或本协议、平台规则所禁止的行为；</view>
                        <view class="sub-item">f). 不得利用在本网站注册的账户进行牟利性经营活动；</view>
                        <view class="sub-item">g). 不得发布任何侵犯他人个人信息、著作权、商标权等知识产权或合法权利的内容；</view>
                    </view>
                    <view class="content-item bold">3、您须对自己在网上的言论和行为承担法律责任，您若在本网站上散布和传播反动、色情或其它违反国家法律的信息，本网站的系统记录有可能作为您违反法律的证据。</view>
                </view>
            </view>

            <view class="section">
                <view class="section-title">六、法律管辖与其他</view>
                <view class="section-content">
                    <view class="content-item">
                        1、本协议的订立、执行和解释及争议的解决均应适用中国法律。如双方就本协议内容或其执行发生任何争议，双方应尽力友好协商解决；协商不成时，应向协议签订地有管辖权的人民法院提起诉讼。本协议签订地为中华人民共和国东莞市石龙镇。
                    </view>
                    <view class="content-item">
                        2、如本服务条款中的任何条款无论因何种原因完全或部分无效或不具有执行力，本服务条款的其余条款仍应有效且具有约束力，并且努力使该规定反映之意向具备效力。
                    </view>
                    <view class="content-item">
                        以上条款如有问题，请联系客服，电话：{{ customerServicePhone }}。
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import { handleNavBack } from '@/utils/utils';
import globalData from '@/globalData';
export default {
    data() {
        return {
            // 这里是需要您填写的变量
            customerServicePhone: '4006331838'  // 客服电话
        }
    },
    methods: {
        handleNavBack,
        getWxAppName() {
            return globalData.wxAppName;
        },
        getCompanyName() {
            return globalData.companyName || '本公司';
        },
    }
}
</script>

<style scoped>
.service-page {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding: 20px;
}

.content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title {
    font-size: 18px;
    font-family: PingFang SC;
    font-weight: bold;
    color: #333333;
    padding-bottom: 24px;
    text-align: center;
}

.note {
    font-size: 14px;
    color: #666;
    line-height: 1.6;
    margin-bottom: 20px;
    text-align: justify;
}

.section {
    margin-bottom: 30px;
}

.section-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
}

.section-content {
    line-height: 1.6;
}

.content-item {
    font-size: 14px;
    color: #666;
    margin-bottom: 15px;
    text-align: justify;
}

.sub-list {
    margin-left: 20px;
    margin-top: 10px;
    margin-bottom: 15px;
}

.sub-item {
    font-size: 14px;
    color: #666;
    margin-bottom: 10px;
    text-align: justify;
}

.green {
    color: #00a86b;
}

.bold {
    font-weight: 600;
}
</style>
