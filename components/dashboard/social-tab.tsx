"use client"

import { useState } from "react"
import type { ParsedDataset } from "@/lib/parsers/types"
import { TopContentTab } from "./top-content-tab"
import { PostDrilldown } from "./post-drilldown"

interface SocialTabProps {
  data: ParsedDataset
  platform: string
}

export function SocialTab({ data, platform }: SocialTabProps) {
  const [selectedPost, setSelectedPost] = useState(null)
  const [showDrilldown, setShowDrilldown] = useState(false)

  return (
    <div className="space-y-8">
      <TopContentTab
        data={data}
        platform={platform}
        onRowClick={(post) => {
          setSelectedPost(post)
          setShowDrilldown(true)
        }}
      />

      <PostDrilldown open={showDrilldown} post={selectedPost} onClose={() => setShowDrilldown(false)} />
    </div>
  )
}
