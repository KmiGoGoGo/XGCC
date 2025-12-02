<template>
    <view class="privacy-page">
        <uv-navbar :border="false" title="隐私政策" autoBack="true" placeholder safeAreaInsetTop></uv-navbar>
        <view class="content">
            <view class="title">{{ getWxAppName() }}隐私政策</view>
            
            <view class="main-text bold">
                欢迎您使用<text class="green">{{ companyName }}</text>服务！我们非常重视您的隐私保护和个人信息保护。本隐私政策适用于您通过任何方式对<text class="green">{{ companyName }}</text>企业版各项服务的访问和使用。
            </view>
            
            <view class="section">
                <view class="section-title">一、重要须知</view>
                <view class="section-content">
                    <view class="content-item">
                        您可以利用<text class="green">{{ companyName }}{{ getWxAppName() }}产品或服务</text>（以下简称"<text class="green">{{ getWxAppName() }}</text>"）搜索充电桩、开启充电、定位您所在的位置，充值、充电等，您具体获得的<text class="green">{{ getWxAppName() }}</text>服务内容可能因为您使用的<text class="green">{{ getWxAppName() }}</text>的版本不同而有所差异。您可以通过多种不同的方式来使用我们的产品和服务，包括<text class="green">{{ getWxAppName() }}</text>的应用程序、微信小程序、微信公众号、等。
                    </view>
                    <view class="content-item">
                        此隐私权政策旨在帮助您了解我们会收集哪些数据、为什么收集这些数据，会利用这些数据做些什么及如何保护这些数据。请您务必认真阅读本隐私政策，在确认充分了解并同意后使用<text class="green">{{ getWxAppName() }}</text>服务。<text class="bold">使用<text class="green">{{ getWxAppName() }}</text>，即表示您同意<text class="green">{{ getWxAppName() }}</text>隐私政策</text>。如果您或您的监护人不同意本隐私政策的任何内容，您应该立即停止使用。
                    </view>
                    <view class="content-item">本隐私政策将帮助您了解以下内容：</view>
                    <view class="sub-list">
                        <view class="sub-item">1、我们收集哪些信息，以及我们对这些信息的使用方式</view>
                        <view class="sub-item">2、我们如何保存及保护您的个人信息</view>
                        <view class="sub-item">3、您的权利</view>
                        <view class="sub-item">4、本政策如何更新</view>
                        <view class="sub-item">5、如何联系我们</view>
                    </view>
                    <view class="content-item">
                        我们深知个人信息对您的重要性，我们将恪守以下原则，保护您的个人信息：权责一致原则、目的明确原则、选择同意原则、最少够用原则、确保安全原则、主体参与原则、公开透明原则等。
                    </view>
                    <view class="content-item bold">
                        我们将按业界成熟的安全标准，采取相应的安全保护措施来保护您的个人信息。
                    </view>
                </view>
            </view>
            
            <view class="section">
                <view class="section-title">二、我们如何收集和使用您的个人信息</view>
                <view class="section-content">
                    <view class="content-item">
                        个人信息是指以电子或者其他方式记录的能够单独或者与其他信息结合识别特定自然人身份或者反映特定自然人活动情况的各种信息。地图数据、场站数据等与您个人无关的信息不属于您的个人信息。
                    </view>
                    <view class="content-item bold">1.您直接提供和我们自动采集的个人信息</view>
                    <view class="sub-list">
                        <view class="sub-item">
                            1)您使用<text class="green">{{ getWxAppName() }}</text>业务功能，如充电、充值等，提交与充电及车辆相关的信息；
                        </view>
                        <view class="sub-item">
                            2)<text class="bold">注册信息</text>。您使用<text class="green">{{ getWxAppName() }}</text>服务，可以登录经注册的<text class="green">{{ getWxAppName() }}</text>帐号。当注册账号时，您可能需向我们提供以下信息：手机号码、帐号名称、头像、年龄，并创建密码等。
                        </view>
                        <view class="sub-item">
                            <text class="green">{{ getWxAppName() }}</text>会不时针对新推出的服务和功能发起运营活动，如果您参加相关运营活动，我们会通过运营活动界面收集包括但不限于您的身份信息、联系方式、交易帐号类信息，以便与您取得联系，向您发运营奖励等。若您不参加相关运营活动则无需提供前述信息。
                        </view>
                        <view class="sub-item">
                            3)<text class="bold">位置信息。当您开启设备定位功能并使用我们基于位置提供的相关服务时，我们可能会收集和处理有关您的设备信息、位置信息、行踪轨迹、网络身份标识信息，以使得您不需要手动输入自身地理坐标就可获得相关服务。</text>我们会使用各种技术进行定位，这些技术包括 IP 地址、GPS 以及能够提供相关信息的其他传感器。您可以通过系统授权关闭定位功能，停止我们对您的地理位置信息的收集，但之后您可能将无法使用相关服务或功能，或者无法达到相关服务拟达到的效果。
                        </view>
                        <view class="sub-item">
                            4)<text class="bold">车辆信息</text>。当您使用<text class="green">{{ getWxAppName() }}</text>车主服务时，您需向我们提供车辆信息（包括但不限于您的车辆品牌、车辆型号、车牌号码、车辆识别代码、发动机号码）。若您不提供上述信息或提供的信息有误，您可能将无法获得相关服务或功能，或者无法达到相关服务拟达到的效果。
                        </view>
                    </view>
                    
                    <view class="content-item bold">2.事先征得授权同意的例外</view>
                    <view class="content-item">请注意：在以下情形中，收集、使用个人信息无需事先征得您的授权同意：</view>
                    <view class="sub-list">
                        <view class="sub-item">a)与国家安全、国防安全直接相关的；</view>
                        <view class="sub-item">b)与公共安全、公共卫生、重大公共利益直接相关的；</view>
                        <view class="sub-item">c)与犯罪侦查、起诉、审判和判决执行等直接有关的；</view>
                        <view class="sub-item">d)出于维护您或其他个人的生命、财产等重大合法权益但又很难得到本人同意的；</view>
                        <view class="sub-item">e)所收集的个人信息是您自行向社会公众公开的；</view>
                        <view class="sub-item">f)从合法公开披露的信息中收集个人信息的，如合法的新闻报道、政府信息公开等渠道；</view>
                        <view class="sub-item">g)根据您的要求向您提供产品或服务所必需的；</view>
                        <view class="sub-item">h)用于维护所提供的产品或服务的安全稳定运行所必需的，例如发现、处置产品或服务的故障；</view>
                        <view class="sub-item">i)法律法规规定的其他情形。</view>
                    </view>
                    
                    <view class="content-item bold">3.个人信息的匿名化处理</view>
                    <view class="content-item">
                        在收集到您的个人信息后，我们将通过技术手段及时对数据进行匿名化处理。在不泄露您个人信息的前提下，<text class="green">{{ getWxAppName() }}</text>有权对匿名化处理后的用户数据库进行挖掘、分析和利用（包括商业性使用）。
                    </view>
                    
                    <view class="content-item">
                        4.您授权我们在您使用<text class="green">{{ getWxAppName() }}</text>产品及服务的期间使用您的个人信息，若您注销帐号，我们将停止使用并删除您的个人信息。
                    </view>
                    
                    <view class="content-item bold">5.设备权限调用</view>
                    <view class="content-item">
                        <text class="green">{{ getWxAppName() }}</text>在提供服务过程中，会调用您的一些设备权限。以下是<text class="green">{{ getWxAppName() }}</text>调用权限对应的业务功能、调用权限的目的以及调用权限前向您询问的情况。
                    </view>
                    <view class="content-item">
                        您可以在设备的设置功能中选择关闭部分或全部权限，从而拒绝<text class="green">{{ getWxAppName() }}</text>收集相应的个人信息。在不同设备中，权限显示方式及关闭方式可能有所不同，具体请参考设备及系统开发方说明或指引。
                    </view>
                    
                    <view class="permission-table">
                        <view class="table-header">
                            <view class="table-cell">设备权限</view>
                            <view class="table-cell">对应业务功能</view>
                            <view class="table-cell">调用权限的目的</view>
                            <view class="table-cell">是否询问</view>
                            <view class="table-cell">用户可否关闭权限</view>
                        </view>
                        <view class="table-row">
                            <view class="table-cell bold">位置</view>
                            <view class="table-cell">用户与场站位置</view>
                            <view class="table-cell">获取当前位置，查找附近的场站</view>
                            <view class="table-cell">首次打开客户端弹窗询问</view>
                            <view class="table-cell">可以</view>
                        </view>
                        <view class="table-row">
                            <view class="table-cell bold">无线数据</view>
                            <view class="table-cell">核心功能</view>
                            <view class="table-cell">在线检索，拉取配置项</view>
                            <view class="table-cell">首次进行网络连接时询问</view>
                            <view class="table-cell">可以</view>
                        </view>
                        <view class="table-row">
                            <view class="table-cell bold">相机</view>
                            <view class="table-cell">扫描充电二维码及用户反馈</view>
                            <view class="table-cell">扫描和拍照</view>
                            <view class="table-cell">首次使用相机功能时</view>
                            <view class="table-cell">可以</view>
                        </view>
                        <view class="table-row">
                            <view class="table-cell bold">图片</view>
                            <view class="table-cell">已拍摄二维码照片和用户反馈</view>
                            <view class="table-cell">使用已拍摄的照片</view>
                            <view class="table-cell">首次访问照片时询问</view>
                            <view class="table-cell">可以</view>
                        </view>
                        <view class="table-row">
                            <view class="table-cell bold">通知</view>
                            <view class="table-cell">全部</view>
                            <view class="table-cell">发送消息</view>
                            <view class="table-cell">首次打开客户端询问</view>
                            <view class="table-cell">可以</view>
                        </view>
                    </view>
                    
                    <view class="content-item bold">
                        6.我们可能使用您的信息用于安全防范和诈骗监测等，以预防、发现、调查欺诈、危害安全、非法或违反与我们的协议、政策或规则的行为，以保护您、我们或我们的关联公司、合作伙伴及社会公众的合法权益。
                    </view>
                    
                    <view class="content-item bold">
                        7.当我们要将信息用于本隐私政策未载明的其它用途时，会事先征求您的同意。当我们要将基于特定目的收集而来的信息用于其他目的时，会事先征求您的同意。
                    </view>
                </view>
            </view>
            
            <view class="section">
                <view class="section-title">三、我们如何保存及保护您的个人信息</view>
                <view class="section-content">
                    <view class="content-item">
                        <text class="bold">1.保存期限</text>。您在使用<text class="green">{{ getWxAppName() }}</text>产品及服务期间，我们将持续为您保存您的个人信息。
                    </view>
                    <view class="content-item bold">
                        2.保存地域。您的个人信息均储存于中华人民共和国境内，如需跨境传输，我们将会单独征得您的授权同意。
                    </view>
                    <view class="content-item">
                        <text class="bold">3.安全措施。</text>
                    </view>
                    <view class="sub-list">
                        <view class="sub-item">1)我们会以"最小化"原则收集、使用、存储和传输用户信息，并通过用户协议和隐私政策告知您相关信息的使用目的和范围。</view>
                        <view class="sub-item">
                            2)我们非常重视信息安全。我们成立了专责团队负责研发和应用多种安全技术和程序等，我们会对安全管理负责人和关键安全岗位的人员进行安全背景审查，我们建立了完善的信息安全管理制度和内部安全事件处置机制等。我们会采取适当的符合业界标准的安全措施和技术手段存储和保护您的个人信息，以防止您的信息丢失、遭到被未经授权的访问、公开披露、使用、毁损、丢失或泄漏。我们会采取一切合理可行的措施，保护您的个人信息。我们会使用加密技术确保数据的保密性；我们会使用受信赖的保护机制防止数据遭到恶意攻击。
                        </view>
                        <view class="sub-item">3)我们会对员工进行数据安全的意识培养和安全能力的培训和考核，加强员工对于保护个人信息重要性的认识。</view>
                        <view class="sub-item">
                            4)我们也请您理解，在互联网行业由于技术的限制和飞速发展以及可能存在的各种恶意攻击手段，即便我们竭尽所能加强安全措施，也不可能始终保证信息的百分之百安全。<text class="bold">请您了解，您使用我们的产品和/或服务时所用的系统和通讯网络，有可能在我们控制之外的其他环节而出现安全问题。根据我们的安全管理制度，个人信息泄露、毁损或丢失事件，一经发生将启动紧急预案，由多个部门组成联合应急响应小组处理。</text>
                        </view>
                    </view>
                    
                    <view class="content-item bold">4.安全事件通知</view>
                    <view class="sub-list">
                        <view class="sub-item">
                            1)我们会制定网络安全事件应急预案，及时处置系统漏洞、计算机病毒、网络攻击、网络侵入等安全风险，在发生危害网络安全的事件时，我们会立即启动应急预案，采取相应的补救措施，并按照规定向有关主管部门报告。
                        </view>
                        <view class="sub-item">
                            2)个人信息泄露、毁损、丢失属于公司安全事件，我们会负责定期组织工作组成员进行安全预案演练，防止此类安全事件发生。若一旦不幸发生，我们将按照最高优先级启动应急预案，组成紧急应急小组，在最短时间内追溯原因并减少损失。
                        </view>
                        <view class="sub-item">
                            3)在不幸发生个人信息安全事件后，我们将按照法律法规的要求，及时向您告知安全事件的基本情况和可能的影响、我们已采取或将要采取的处理措施、您可自主防范和降低的风险的建议、对您的补救措施等。
                        </view>
                    </view>
                </view>
            </view>
            
            <view class="section">
                <view class="section-title">四、您的权利</view>
                <view class="section-content">
                    <view class="content-item">
                        按照中国相关的法律、法规、标准，以及其他国家、地区的通行做法，我们保障您对自己的个人信息行使以下权利：
                    </view>
                    <view class="content-item">
                        <text class="bold">1、访问权。</text>原则上您可以通过如下方式访问您的个人信息：帐户信息：您可以随时登录<text class="green">{{ getWxAppName() }}</text>app，访问或编辑您的帐户中的个人资料信息、更改您的密码、添加安全信息、进行账户关联或身份认证等。
                    </view>
                    <view class="content-item">
                        <text class="bold">2、更正权。</text>当您发现我们处理的关于您的个人信息有错误时，经对您的身份进行验证，且更正不影响信息的客观性和准确性的情况下，您有权对错误或不完整的信息作出更正或更新，您可以自行在<text class="green">{{ getWxAppName() }}</text>内进行更正，或通过反馈与报错等将您的更正申请提交给我们。
                    </view>
                    <view class="content-item">
                        <text class="bold">3、删除权。</text>在以下情形中，您可以向我们提出删除个人信息的请求：
                    </view>
                    <view class="sub-list">
                        <view class="sub-item">1)如果我们终止<text class="green">{{ getWxAppName() }}</text>的产品运营及服务；</view>
                        <view class="sub-item">2)如果您注销了帐号，我们会删除您的个人信息或做匿名化处理；</view>
                        <view class="sub-item">3)涉及商业秘密的。</view>
                    </view>
                    <view class="content-item">
                        <text class="bold">4、提前获知产品和服务停止运营权。</text><text class="green">{{ getWxAppName() }}</text>愿一直陪伴您，若因特殊原因导致<text class="green">{{ getWxAppName() }}</text>产品和服务被迫停止运营，我们将提前向您发送短信或其他合适的能触达您的方式通知您，并将停止对您个人信息的收集，同时会按照法律规定对所持有的您的个人信息进行删除或匿名化处理等。<text class="bold">为保障安全，您可能需要提供书面请求，或以其他方式证明您的身份。</text>我们可能会先要求您验证自己的身份，然后再处理您的请求。我们将在三十天内做出答复。
                    </view>
                    <view class="content-item">
                        5、在以下情形中，按照法律法规要求，我们将无法响应您的<text class="bold">更正、删除、注销信息</text>的请求：
                    </view>
                    <view class="sub-list">
                        <view class="sub-item">1)与国家安全、国防安全直接相关的；</view>
                        <view class="sub-item">2)与公共安全、公共卫生、重大公共利益直接相关的；</view>
                        <view class="sub-item">3)与犯罪侦查、起诉、审判和执行判决等直接相关的；</view>
                        <view class="sub-item">
                            4)我们有充分证据表明您存在主观恶意或滥用权利的（如您的请求将危害公共安全和其他人合法权益，或您的请求超出了一般技术手段和商业成本可覆盖的范围）；
                        </view>
                        <view class="sub-item">5)响应个人信息主体的请求将导致您或其他个人、组织的合法权益受到严重损害的；</view>
                        <view class="sub-item">6)涉及商业秘密的。</view>
                    </view>
                </view>
            </view>
            
            <view class="section">
                <view class="section-title">五、未成年人的个人信息保护</view>
                <view class="section-content">
                    <view class="content-item">
                        1、<text class="green">{{ getWxAppName() }}</text>非常重视对未成年人个人信息的保护。若您是18周岁以下的未成年人，在使用我们的产品与/或服务前，<text class="bold">应事先取得您监护人的同意。</text><text class="green">{{ getWxAppName() }}</text>根据国家相关法律法规的规定保护未成年人的个人信息。
                    </view>
                    <view class="content-item">
                        2、我们不会主动直接向未成年人收集其个人信息。对于经监护人同意而收集未成年人个人信息的情况，我们只会在受到法律允许、监护人同意或者保护未成年人所必要的情况下使用、共享、转让或披露此信息。
                    </view>
                    <view class="content-item">
                        3、如果有事实证明未成年人并未取得监护人同意的情况下注册使用了我们的产品与/或服务，我们会与相关监护人协商，并设法尽快删除相关个人信息。
                    </view>
                </view>
            </view>
            
            <view class="section">
                <view class="section-title">六、第三方网站和服务</view>
                <view class="section-content">
                    <view class="content-item">
                        我们的隐私政策不适用于第三方提供的产品或服务。取决于您所使用的<text class="green">{{ getWxAppName() }}</text>产品或服务，其中可能包括第三方的产品或服务，涉及相机处理、系统清理及安全相关服务、支付、地图导航、分享、推送、信息过滤、输入法等类型，其中一些会以第三方网站的链接形式提供，还有一些会以SDK、API等形式接入。当您使用这些产品或服务时，也可能收集您的信息。因此，我们强烈建议您花时间阅读该第三方的隐私政策，就像阅读我们的隐私政策一样。我们不对第三方如何使用他们向您收集的个人信息负责，也不能控制其使用。我们的隐私政策不适用于通过我们的服务链接的其他网站。
                    </view>
                    <view class="content-item">
                        以下提供了当您使用上述特定产品或服务时，所适用的第三方条款和隐私政策的示例：
                    </view>
                    <view class="content-item">
                        使用第三方支付服务完成和支付订单时，您在支付时提供的个人信息将依据第三方支付服务提供商的隐私政策进行处理。
                    </view>
                    <view class="content-item">
                        使用高德地图作为基础预览充电站信息时，将适用高德地图开放平台隐私权政策：<text class="green">https://lbs.amap.com/pages/privacy</text>
                    </view>
                </view>
            </view>
            
            <view class="section">
                <view class="section-title">七、隐私政策的修订</view>
                <view class="section-content">
                    <view class="content-item">我们的隐私政策可能变更。</view>
                    <view class="content-item">未经您明确同意，我们不会削减您按照本隐私政策所应享有的权利。我们会发布对本隐私政策所做的任何变更。</view>
                    <view class="content-item">
                        若您不同意该等变更可以停止使用<text class="green">{{ getWxAppName() }}</text>产品和服务，若您继续使用我们的产品和/或服务，即表示您同意受修订后的本隐私政策的约束。
                    </view>
                    <view class="content-item">本政策所指的重大变更包括但不限于：</view>
                    <view class="content-item">1、我们的服务模式发生重大变化。如处理个人信息的目的、处理的个人信息类型、个人信息的使用方式等；</view>
                    <view class="content-item">2、我们在所有权结构、组织架构等方面发生重大变化。如业务调整、破产并购等引起的所有者变更等；</view>
                    <view class="content-item">3、个人信息共享、转让或公开披露的主要对象发生变化；</view>
                    <view class="content-item">4、您参与个人信息处理方面的权利及其行使方式发生重大变化；</view>
                    <view class="content-item">5、我们负责处理个人信息安全的责任部门、联络方式及投诉渠道发生变化时；</view>
                    <view class="content-item">6、个人信息安全影响评估报告表明存在高风险时。</view>
                </view>
            </view>
            
            <view class="section">
                <view class="section-title">八、投诉处理</view>
                <view class="section-content">
                    <view class="content-item">
                        1、您对<text class="green">{{ getWxAppName() }}</text>企业版及本隐私政策有任何意见或建议联系客服，电话：{{ customerServicePhone }}，工作日时间09:00-18:00。
                    </view>
                    <view class="content-item">2、关于本用户服务条款的问题，您可以通过如下联络方式同我们联系：</view>
                    <view class="content-item bold">{{ companyAddress }}</view>
                    <view class="content-item">
                        为保障我们高效处理您的问题并及时向您反馈，需要您提交身份证明、有效联系方式和书面请求及相关证据，我们会在验证您身份的前提下处理您的请求。
                    </view>
                    <view class="content-item bold">
                        再次感谢您对<text class="green">{{ companyName }}</text>的信任和使用！ 注：本隐私政策版本发布日期为 2025 年 12月 1 日，于 2025 年 12月 1 日起正式生效。
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import globalData from '../../globalData.js'
export default {
    data() {
        return {
            // 这里是需要您填写的变量
            companyName: '光烨科技',  // 公司名称
            customerServicePhone: '4006331838',  // 客服电话
            companyAddress: '广东省东莞市石龙镇美能达路光华实业6-8号'  // 公司地址
        }
    },
    methods: {
        getWxAppName() {
            return globalData.wxAppName;
        },
    }
}
</script>

<style scoped>
.privacy-page {
    min-height: 100vh;
    background-color: #f5f7fa;
    padding: 20px;
}

.content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: justify;
}

.title {
    font-size: 18px;
    font-family: PingFang SC;
    font-weight: bold;
    color: #333333;
    padding-bottom: 24px;
    text-align: center;
}

.main-text {
    font-size: 12px;
    font-weight: 400;
    margin-bottom: 24px;
    color: #333333;
    font-family: PingFang SC;
}

.section {
    margin-bottom: 30px;
}

.section-title {
    font-size: 16px;
    font-weight: 800;
    color: #333;
    margin-bottom: 14px;
}

.section-content {
    line-height: 1.6;
}

.content-item {
    display: block;
    font-size: 12px;
    color: #333333;
    margin-bottom: 10px;
    text-align: start;
    font-family: PingFang SC;
}

.sub-list {
    margin-left: 20px;
    margin-top: 10px;
    margin-bottom: 15px;
}

.sub-item {
    display: block;
    font-size: 12px;
    color: #333333;
    margin-bottom: 3px;
    text-align: start;
    font-family: PingFang SC;
}

.green {
    font-family: PingFang-SC-Bold !important;
    font-weight: 800 !important;
    color: #01ca7e;
}

.bold {
    font-family: PingFang-SC-Bold !important;
    font-weight: 800 !important;
}

.permission-table {
    margin: 15px 0;
    border: 1px solid #b8b8b8;
    border-radius: 4px;
    overflow: hidden;
}

.table-header {
    display: flex;
    background-color: #e6e6e6;
}

.table-row {
    display: flex;
    border-top: 1px solid #b8b8b8;
}

.table-cell {
    flex: 1;
    padding: 8px 4px;
    background-color: #f5f6fa;
    font-size: 12px;
    font-family: PingFang SC;
    color: #333333;
    text-align: center;
    border-right: 1px solid #b8b8b8;
    word-break: break-all;
}

.table-cell:last-child {
    border-right: none;
}

.table-header .table-cell {
    font-weight: bold;
    background-color: #e6e6e6;
}
</style>
