/**
 * 将表单配置转换为结构化描述
 * @param {Array} config 表单配置数组
 * @returns {Object} 结构化描述
 */
function parseFormConfig(config) {
    const description = {
        fields: [] // 字段列表
    }

    // 解析字段配置
    config.forEach(field => {
        const fieldDesc = {
            name: field.fieldName,
            label: field.labelText,
            type: field.type,
            required: field.rules?.some(rule => rule.required) || false
        }

        // 处理特殊字段配置
        if (field.fieldConfig) {
            if (field.fieldConfig.maxlength) {
                fieldDesc.maxLength = field.fieldConfig.maxlength
            }
        }

        // 处理选项
        if (field.options) {
            fieldDesc.options = field.options
        }

        // 处理树形数据
        if (field.treeData) {
            fieldDesc.treeData = field.treeData
        }

        description.fields.push(fieldDesc)
    })

    return description
}

/**
 * 生成描述文本
 * @param {Object} description 结构化描述对象
 * @returns {String} 描述文本
 */
function generateDescription(description) {
    let text = `表单配置描述：\n\n`

    description.fields.forEach(field => {
        text += `${field.label}(${field.name})：\n`
        text += `  类型：${field.type}\n`
        text += `  必填：${field.required ? '是' : '否'}\n`
        
        if (field.maxLength) {
            text += `  最大长度：${field.maxLength}\n`
        }
        if (field.options) {
            text += `  选项：${field.options.map(opt => `${opt.label}(${opt.value})`).join(', ')}\n`
        }
        if (field.treeData) {
            const formatTreeData = (data) => {
                return data.map(item => {
                    const childrenText = item.children?.length 
                        ? ` [${formatTreeData(item.children)}]` 
                        : '';
                    return `${item.label}${childrenText}`;
                }).join(', ');
            };
            text += `  树形数据：${formatTreeData(field.treeData)}\n`
        }
        text += '\n'
    })

    return text
}

export {
    parseFormConfig,
    generateDescription
}