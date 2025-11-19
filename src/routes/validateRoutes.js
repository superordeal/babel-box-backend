const express = require('express');
const router = express.Router();
const aiServiceManager = require('../controllers/aiServiceManager');

/**
 * 验证内容
 * POST /api/validate/content
 * 校验分类匹配度和内容新鲜度
 */
router.post('/content', async (req, res) => {
  try {
    const { title, category, content } = req.body;

    // 验证输入 - 标题和分类必须有，内容可选（支持 AI 补全场景）
    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: '标题和分类不能为空'
      });
    }

    // 判断是补全模式还是更新模式
    const isCompletion = !content || content.trim() === '';
    
    console.log(`开始 AI 校验 - 模式: ${isCompletion ? '补全' : '更新'} - 标题: ${title} - 分类: ${category}`);
    
    // 生成对应的 AI Prompt
    let validationPrompt;
    if (isCompletion) {
      // AI 补全模式 - 生成内容
      validationPrompt = `请为以下八股文补全内容：

题目：${title}
分类：${category}

请生成一份高质量的八股文内容（200-500字），然后返回 JSON 格式的结果，包含以下字段：
1. suggestedContent: 补全的八股文内容（必须提供）
2. categoryScore: 补全内容与分类的匹配度（0-100）
3. contentStatus: 内容状态（固定值 'perfect' 表示新生成的优质内容）
4. contentStatusLabel: 中文描述，如"AI 补全的优质内容"
5. suggestions: 关于这份内容的说明或建议
6. shouldUpdate: false
7. suggestedCategory: null（除非建议更改分类）
8. suggestedTitle: null（除非建议修改标题）

只返回 JSON，不要其他文字。`;
    } else {
      // AI 更新模式 - 优化现有内容
      validationPrompt = `请对以下八股文进行评估和改进建议：

题目：${title}
分类：${category}

内容：
${content}

请返回 JSON 格式的评估结果，包含以下字段：
1. categoryScore: 分类匹配度（0-100）
2. contentStatus: 内容状态（'unclear' 不详细, 'outdated' 已过时, 'needs-update' 需要更新, 'fresh' 新鲜, 'perfect' 非常适合面试）
3. contentStatusLabel: 中文描述（不超过20字）
4. suggestions: AI 的具体改进建议
5. shouldUpdate: 是否需要更新（boolean）
6. suggestedCategory: 如果分类匹配度不高（<60），请提供更合适的分类名称，否则为null
7. suggestedContent: 改进后的内容（如果需要修改则提供，否则为null）
8. suggestedTitle: 改进后的标题（如果建议修改则提供，否则为null）

只返回 JSON，不要其他文字。`;
    }

    let responseText;
    let aiError = null;
    
    try {
      responseText = await aiServiceManager.generateText(validationPrompt);
      console.log('AI 响应成功，响应长度:', responseText.length);
    } catch (error) {
      console.error('AI 服务调用失败:', error.message);
      aiError = error;
      responseText = null;
    }

    // 解析 AI 响应
    let validationResult;
    
    if (responseText) {
      try {
        // 尝试提取 JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          validationResult = JSON.parse(jsonMatch[0]);
          console.log('JSON 解析成功');
        } else {
          throw new Error('无法提取 JSON');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        console.error('原始响应:', responseText.substring(0, 200));
        responseText = null; // 标记为失败，使用默认值
      }
    }
    
    // 如果 AI 服务失败或响应解析失败，使用默认值
    if (!responseText) {
      console.warn('使用默认值，因为 AI 服务失败或响应无效');
      validationResult = isCompletion ? {
        categoryScore: 85,
        contentStatus: 'perfect',
        contentStatusLabel: 'AI 补全内容',
        suggestions: 'AI 已为您补全内容，请应用建议查看。（若未获得满意的内容，请手动编辑后重试）',
        shouldUpdate: false,
        suggestedCategory: null,
        suggestedContent: '由于网络或服务原因，AI 未能生成内容。请手动输入内容，或稍后重试。',
        suggestedTitle: null
      } : {
        categoryScore: 70,
        contentStatus: 'fresh',
        contentStatusLabel: '内容质量良好',
        suggestions: '内容质量不错，建议可直接使用。（若有特殊改进建议，请手动编辑）',
        shouldUpdate: false,
        suggestedCategory: null,
        suggestedContent: null,
        suggestedTitle: null
      };
    }

    // 验证和规范化结果
    validationResult = normalizeValidationResult(validationResult);

    res.json({
      success: true,
      data: validationResult
    });
  } catch (error) {
    console.error('Content validation error:', error);
    res.status(500).json({
      success: false,
      message: '内容校验失败：' + error.message,
      error: error.message
    });
  }
});

/**
 * 规范化验证结果
 */
function normalizeValidationResult(result) {
  const normalized = {
    categoryScore: Math.max(0, Math.min(100, parseInt(result.categoryScore) || 70)),
    contentStatus: validateContentStatus(result.contentStatus),
    contentStatusLabel: (result.contentStatusLabel || '内容待评估').substring(0, 20),
    suggestions: (result.suggestions || '请根据需要更新内容').substring(0, 500),
    shouldUpdate: Boolean(result.shouldUpdate)
  };

  // 添加建议分类（如果有）
  if (result.suggestedCategory && typeof result.suggestedCategory === 'string') {
    normalized.suggestedCategory = result.suggestedCategory.trim().substring(0, 50);
  }

  // 建议的替换内容与标题（可选）
  if (result.suggestedContent && typeof result.suggestedContent === 'string') {
    normalized.suggestedContent = result.suggestedContent.trim().substring(0, 2000);
  } else {
    normalized.suggestedContent = null;
  }

  if (result.suggestedTitle && typeof result.suggestedTitle === 'string') {
    normalized.suggestedTitle = result.suggestedTitle.trim().substring(0, 200);
  } else {
    normalized.suggestedTitle = null;
  }

  return normalized;
}

/**
 * 验证内容状态值
 */
function validateContentStatus(status) {
  const validStatuses = ['unclear', 'outdated', 'needs-update', 'fresh', 'perfect'];
  if (validStatuses.includes(status)) {
    return status;
  }
  return 'fresh';
}

module.exports = router;
