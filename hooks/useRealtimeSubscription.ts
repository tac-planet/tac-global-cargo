"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

type TableName =
  | "shipments"
  | "manifests"
  | "invoices"
  | "exceptions"
  | "customers"
  | "hubs"
  | "tracking_events"
  | "scan_events";

interface UseRealtimeOptions {
  table: TableName;
  queryKey: readonly unknown[];
  schema?: string;
  filter?: string;
  enabled?: boolean;
}

/**
 * Subscribes to Supabase Realtime Postgres Changes for a given table
 * and automatically invalidates the corresponding React Query cache
 * whenever an INSERT, UPDATE, or DELETE occurs.
 */
export function useRealtimeSubscription({
  table,
  queryKey,
  schema = "public",
  filter,
  enabled = true,
}: UseRealtimeOptions) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const supabase = createClient();
    const channelName = `realtime-${table}-${filter ?? "all"}`;

    const channelConfig: Record<string, unknown> = {
      event: "*",
      schema,
      table,
    };
    if (filter) {
      channelConfig.filter = filter;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes" as any,
        channelConfig as any,
        (_payload: unknown) => {
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, schema, filter, enabled, queryClient, queryKey]);
}
