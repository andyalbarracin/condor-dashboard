/**
 * File: content-analyzer.ts
 * Path: /lib/reports/content-analyzer.ts
 * Last Modified: 2026-01-19
 * Description: Analiza patrones en content - COMPATIBLE con estructura dataPoints
 */

interface DataPoint {
  id: string
  source: 'linkedin' | 'twitter'
  date: string
  title: string
  metrics: {
    impressions?: number
    engagements?: number
    clicks?: number
    engagement_rate?: number
    reactions?: number
    comments?: number
    shares?: number
    reposts?: number
  }
}

interface ContentPattern {
  name: string
  description: string
  posts_matching: number
  avg_engagement_rate: number
  improvement_vs_avg: number
  examples: string[]
}

interface DayPerformance {
  day: string
  post_count: number
  avg_engagement_rate: number
  avg_engagements: number
  is_best_day: boolean
}

export interface ContentAnalysis {
  patterns: ContentPattern[]
  best_posting_days: DayPerformance[]
  top_performing_posts: DataPoint[]
  content_type_recommendations: string[]
  specific_tactics: string[]
}

/**
 * Analiza los posts y encuentra patrones de contenido exitoso
 */
export function analyzeContentPatterns(dataPoints: DataPoint[]): ContentAnalysis {
  if (dataPoints.length === 0) {
    return {
      patterns: [],
      best_posting_days: [],
      top_performing_posts: [],
      content_type_recommendations: [],
      specific_tactics: []
    }
  }

  // Calcular engagement rate para cada post si no existe
  const postsWithRate = dataPoints.map(p => {
    let rate = Number(p.metrics.engagement_rate || 0)
    
    // Si engagement_rate no existe, calcularlo
    if (!rate && p.metrics.impressions && p.metrics.impressions > 0) {
      const eng = Number(p.metrics.engagements || 0)
      rate = (eng / p.metrics.impressions) * 100
    }
    
    // Si rate está en decimal (0.0715), convertir a porcentaje
    if (rate > 0 && rate < 1) {
      rate = rate * 100
    }
    
    return {
      ...p,
      calculated_engagement_rate: rate
    }
  })

  // Calcular promedio general
  const avgEngagementRate = postsWithRate.reduce((sum, p) => sum + p.calculated_engagement_rate, 0) / postsWithRate.length

  // Top 10 posts por engagement rate
  const topPosts = [...postsWithRate]
    .sort((a, b) => b.calculated_engagement_rate - a.calculated_engagement_rate)
    .slice(0, 10)
    .map(p => {
      const { calculated_engagement_rate, ...original } = p
      return original
    })

  // Analizar patrones
  const patterns: ContentPattern[] = []

  // PATRÓN 1: Posts con preguntas
  const questionPosts = postsWithRate.filter(p => {
    const title = p.title.toLowerCase()
    return title.includes('?') || 
           title.includes('how ') || 
           title.includes('what ') || 
           title.includes('where ') ||
           title.includes('when ') ||
           title.includes('why ')
  })
  
  if (questionPosts.length >= 3) {
    const avgRate = questionPosts.reduce((sum, p) => sum + p.calculated_engagement_rate, 0) / questionPosts.length
    const improvement = ((avgRate / avgEngagementRate - 1) * 100)
    
    patterns.push({
      name: 'Questions & Problem Framing',
      description: 'Posts that ask questions or frame customer problems',
      posts_matching: questionPosts.length,
      avg_engagement_rate: avgRate,
      improvement_vs_avg: improvement,
      examples: questionPosts
        .sort((a, b) => b.calculated_engagement_rate - a.calculated_engagement_rate)
        .slice(0, 3)
        .map(p => p.title.substring(0, 60))
    })
  }

  // PATRÓN 2: Call-to-Action directo
  const ctaPosts = postsWithRate.filter(p => {
    const title = p.title
    return /^(Stop|Start|Think|Track|Reduce|Improve|Boost|Increase|Learn|Discover|See)/i.test(title)
  })
  
  if (ctaPosts.length >= 3) {
    const avgRate = ctaPosts.reduce((sum, p) => sum + p.calculated_engagement_rate, 0) / ctaPosts.length
    const improvement = ((avgRate / avgEngagementRate - 1) * 100)
    
    patterns.push({
      name: 'Direct Call-to-Action',
      description: 'Posts with imperative verbs that command attention',
      posts_matching: ctaPosts.length,
      avg_engagement_rate: avgRate,
      improvement_vs_avg: improvement,
      examples: ctaPosts
        .sort((a, b) => b.calculated_engagement_rate - a.calculated_engagement_rate)
        .slice(0, 3)
        .map(p => p.title.substring(0, 60))
    })
  }

  // PATRÓN 3: Posts sobre problemas/riesgos
  const problemPosts = postsWithRate.filter(p => {
    const title = p.title.toLowerCase()
    return title.includes('fail') || 
           title.includes('risk') || 
           title.includes('leak') ||
           title.includes('waste') ||
           title.includes('dead') ||
           title.includes('problem') ||
           title.includes('issue')
  })
  
  if (problemPosts.length >= 3) {
    const avgRate = problemPosts.reduce((sum, p) => sum + p.calculated_engagement_rate, 0) / problemPosts.length
    const improvement = ((avgRate / avgEngagementRate - 1) * 100)
    
    if (improvement > 0) {
      patterns.push({
        name: 'Problem-Focused Content',
        description: 'Posts highlighting pain points and risks',
        posts_matching: problemPosts.length,
        avg_engagement_rate: avgRate,
        improvement_vs_avg: improvement,
        examples: problemPosts
          .sort((a, b) => b.calculated_engagement_rate - a.calculated_engagement_rate)
          .slice(0, 3)
          .map(p => p.title.substring(0, 60))
      })
    }
  }

  // PATRÓN 4: Posts técnicos específicos
  const technicalPosts = postsWithRate.filter(p => {
    const title = p.title.toLowerCase()
    return title.includes('how to') ||
           title.includes('monitoring') ||
           title.includes('data') ||
           title.includes('control') ||
           title.includes('autonomous') ||
           title.includes('edge') ||
           title.includes('site')
  })
  
  if (technicalPosts.length >= 3) {
    const avgRate = technicalPosts.reduce((sum, p) => sum + p.calculated_engagement_rate, 0) / technicalPosts.length
    const improvement = ((avgRate / avgEngagementRate - 1) * 100)
    
    if (improvement > 0) {
      patterns.push({
        name: 'Technical Deep-Dives',
        description: 'Specific technical content and how-to guides',
        posts_matching: technicalPosts.length,
        avg_engagement_rate: avgRate,
        improvement_vs_avg: improvement,
        examples: technicalPosts
          .sort((a, b) => b.calculated_engagement_rate - a.calculated_engagement_rate)
          .slice(0, 3)
          .map(p => p.title.substring(0, 60))
      })
    }
  }

  // Analizar días de la semana
  const dayPerformance = analyzeBestPostingDays(postsWithRate)

  // Generar recomendaciones
  const recommendations = generateSmartRecommendations(patterns, dayPerformance, topPosts)

  return {
    patterns,
    best_posting_days: dayPerformance,
    top_performing_posts: topPosts,
    content_type_recommendations: recommendations.content_types,
    specific_tactics: recommendations.tactics
  }
}

/**
 * Analiza qué días de la semana funcionan mejor
 */
function analyzeBestPostingDays(postsWithRate: any[]): DayPerformance[] {
  const dayGroups: { [key: string]: any[] } = {}
  
  postsWithRate.forEach(post => {
    const date = new Date(post.date)
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
    
    if (!dayGroups[dayName]) {
      dayGroups[dayName] = []
    }
    dayGroups[dayName].push(post)
  })

  const dayPerformances: DayPerformance[] = Object.entries(dayGroups)
    .map(([day, dayPosts]) => {
      const avgRate = dayPosts.reduce((sum, p) => sum + p.calculated_engagement_rate, 0) / dayPosts.length
      const avgEng = dayPosts.reduce((sum, p) => sum + Number(p.metrics.engagements || 0), 0) / dayPosts.length
      
      return {
        day,
        post_count: dayPosts.length,
        avg_engagement_rate: avgRate,
        avg_engagements: avgEng,
        is_best_day: false
      }
    })
    .filter(d => d.post_count >= 2) // Solo días con al menos 2 posts
    .sort((a, b) => b.avg_engagement_rate - a.avg_engagement_rate)

  // Marcar el mejor día
  if (dayPerformances.length > 0) {
    dayPerformances[0].is_best_day = true
  }

  return dayPerformances
}

/**
 * Genera recomendaciones específicas basadas en patrones encontrados
 */
function generateSmartRecommendations(
  patterns: ContentPattern[],
  dayPerformance: DayPerformance[],
  topPosts: DataPoint[]
): { content_types: string[], tactics: string[] } {
  const contentTypes: string[] = []
  const tactics: string[] = []

  // Ordenar patrones por mejora
  const sortedPatterns = [...patterns].sort((a, b) => b.improvement_vs_avg - a.improvement_vs_avg)

  // Recomendar basado en los mejores patrones
  sortedPatterns.forEach((pattern, idx) => {
    if (idx === 0 && pattern.improvement_vs_avg > 10) {
      contentTypes.push(
        `${pattern.name}: Posts using this format perform ${pattern.improvement_vs_avg.toFixed(1)}% better than average. ` +
        `Example: "${pattern.examples[0]}"`
      )
      
      tactics.push(
        `Double down on ${pattern.name.toLowerCase()} - they're your top performers. ` +
        `Create 2-3 more posts per week using this approach.`
      )
    } else if (idx < 3 && pattern.improvement_vs_avg > 5) {
      contentTypes.push(
        `${pattern.name}: ${pattern.improvement_vs_avg > 0 ? '+' : ''}${pattern.improvement_vs_avg.toFixed(1)}% vs average`
      )
    }
  })

  // Mejor día para postear
  if (dayPerformance.length > 0) {
    const bestDay = dayPerformance[0]
    tactics.push(
      `Post on ${bestDay.day}s - your best performing day with ${bestDay.avg_engagement_rate.toFixed(1)}% avg engagement rate ` +
      `(based on ${bestDay.post_count} posts).`
    )
  }

  // Analizar top posts para más insights
  if (topPosts.length > 0) {
    const topPost = topPosts[0]
    const avgClicks = topPosts.reduce((sum, p) => sum + Number(p.metrics.clicks || 0), 0) / topPosts.length
    const topClicks = Number(topPost.metrics.clicks || 0)
    
    if (topClicks > avgClicks * 2) {
      tactics.push(
        `High-CTR posts like "${topPost.title.substring(0, 40)}..." generate ${topClicks} clicks. ` +
        `Include clear value propositions and specific benefits.`
      )
    }
  }

  // Si no hay suficientes patrones, dar recomendaciones genéricas
  if (contentTypes.length === 0) {
    contentTypes.push(
      'Experiment with question-based headlines to increase engagement',
      'Use direct CTAs (Stop, Start, Think) to command attention',
      'Share specific technical insights and how-to content'
    )
  }

  if (tactics.length === 0) {
    tactics.push(
      'Test different posting times to find your optimal schedule',
      'Analyze which topics resonate most with your audience',
      'Increase posting frequency to gather more performance data'
    )
  }

  return { content_types: contentTypes, tactics }
}