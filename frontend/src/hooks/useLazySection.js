import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
      fetchPublicSection,
      selectPublicSection,
      PUBLIC_SECTION_TTL,
} from "@/store/public.slice";
import { useIntersectionObserver } from "./useIntersectionObserver";

/**
 * Loads one public section when it approaches the viewport.
 *
 * Request behaviour:
 * - `priority: true` fetches immediately (used by the hero / contact route).
 * - fresh Redux data is reused for `ttl` milliseconds.
 * - the async thunk's `condition` deduplicates StrictMode/concurrent calls.
 * - failed sections stay failed until an explicit `retry()` (no request loop).
 */
export const useLazySection = (
      section,
      {
            rootMargin = "300px 0px",
            enabled = true,
            priority = false,
            ttl = PUBLIC_SECTION_TTL,
      } = {}
) => {
      const dispatch = useDispatch();
      const sectionState = useSelector((state) => selectPublicSection(state, section));
      const requestedRef = useRef(false);

      const { ref, isIntersecting } = useIntersectionObserver({
            rootMargin,
            once: true,
            enabled: enabled && !priority,
      });

      const shouldFetch = enabled && (priority || isIntersecting);
      const status = sectionState?.status || "idle";
      const fetchedAt = sectionState?.fetchedAt || 0;

      useEffect(() => {
            if (!shouldFetch) return;

            const isFresh = status === "succeeded" && Date.now() - fetchedAt < ttl;
            if (isFresh || status === "loading") return;

            // A failed section must only retry through the explicit retry()
            // action, so a network outage cannot create a request loop.
            if (status === "failed" && requestedRef.current) return;

            requestedRef.current = true;
            dispatch(fetchPublicSection({ section }));
      }, [dispatch, section, shouldFetch, status, fetchedAt, ttl]);

      const retry = useCallback(() => {
            requestedRef.current = true;
            dispatch(fetchPublicSection({ section, force: true }));
      }, [dispatch, section]);

      return {
            ref,
            data: sectionState?.data,
            status,
            error: sectionState?.error || null,
            isLoading: status === "loading",
            isError: status === "failed",
            isIdle: status === "idle",
            retry,
      };
};

export default useLazySection;
