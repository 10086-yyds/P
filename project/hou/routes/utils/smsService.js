const axios = require('axios');
const moment = require('moment');
const crypto = require('crypto');
const smsConfig = require('../config/sms.config');

class SmsService {
    constructor() {
        this.config = smsConfig;
    }

    // 生成签名
    getAuthorization() {
        const timestamp = moment().format('YYYYMMDDHHmmss');
        const { accountSid, authToken } = this.config;
        const sigParameter = accountSid + authToken + timestamp;
        return {
            timestamp,
            sig: crypto.createHash('md5').update(sigParameter).digest('hex').toUpperCase()
        };
    }

    // 发送短信
    async sendSms(phoneNumber, code) {
        try {
            const { timestamp, sig } = this.getAuthorization();
            const url = `${this.config.baseUrl}/2013-12-26/Accounts/${this.config.accountSid}/SMS/TemplateSMS?sig=${sig}`;
            
            const requestBody = {
                to: phoneNumber,
                appId: this.config.appId,
                templateId: this.config.templateId,
                datas: [code, "5"] // 验证码和有效期（分钟）
            };

            const auth = Buffer.from(`${this.config.accountSid}:${timestamp}`).toString('base64');

            const response = await axios({
                method: 'post',
                url: url,
                data: requestBody,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json;charset=utf-8',
                    'Authorization': auth
                }
            });

            console.log('短信发送结果:', response.data);
            
            if (response.data.statusCode === '000000') {
                return {
                    success: true,
                    message: '发送成功'
                };
            } else {
                throw new Error(response.data.statusMsg || '发送失败');
            }
        } catch (error) {
            console.error('短信发送错误:', error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.statusMsg || error.message || '发送失败'
            };
        }
    }
}

module.exports = new SmsService(); 