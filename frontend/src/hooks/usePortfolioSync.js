import { useEffect, useRef } from "react";
import { useDispatch, useStore } from "react-redux";
import { useLocation } from "react-router-dom";
import { useSocket } from "./useSocket";
import {
      subscribeSectionUpdates,
      normalizeSection,
      recordServerVersion,
      getLocalMutationAt,
} from "@/utils/sectionCache";
import { invalidateSectionHttpCache } from "@/config/api";
import { updatePublicData, externalSectionUpdated } from "@/store/public.slice";
import {
      markPublicProjectsUpdated,
      getProjectBySlugThunk,
      getAllProjectsAdmin,
      getFeaturedProjects,
} from "@/store/project.slice";
import { getHeroData } from "@/store/hero.slice";
import { getAboutData } from "@/store/about.slice";
import { getAllEducationData } from "@/store/education.slice";
import { getAllCategories } from "@/store/skills.slice";
import { getAllServicesAdmin } from "@/store/services.slice";
import { getContactDetails } from "@/store/contact.slice";

const LOCAL_MUTATION_GRACE_MS = 4000;

const ADMIN_LOADERS = {
      hero: {
            hasData: (state) => Boolean(state.hero?.heroData),
            actions: () => [getHeroData()],
      },
      about: {
            hasData: (state) => Boolean(state.about?.aboutData),
            actions: () => [getAboutData()],
      },
      education: {
            hasData: (state) => (state.education?.educationData?.length || 0) > 0,
            actions: () => [getAllEducationData()],
      },
      skills: {
            hasData: (state) => (state.skills?.categories?.length || 0) > 0,
            actions: () => [getAllCategories()],
      },
      projects: {
            hasData: (state) =>
                  (state.project?.projectsData?.length || 0) > 0 ||
                  (state.project?.featuredProjects?.length || 0) > 0,
            actions: () => [getAllProjectsAdmin(), getFeaturedProjects()],
      },
      services: {
            hasData: (state) => (state.services?.servicesData?.length || 0) > 0,
            actions: () => [getAllServicesAdmin()],
      },
      contact: {
            hasData: (state) => Boolean(state.contact?.contactDetails),
            actions: () => [getContactDetails()],
      },
};

const resolveVersion = (event, fallback) => {
      if (Number.isFinite(event?.version)) return event.version;
      if (Number.isFinite(event?.updatedAt)) return event.updatedAt;
      return fallback;
};

export const usePortfolioSync = () => {
      const dispatch = useDispatch();
      const store = useStore();
      const location = useLocation();

      const dispatchRef = useRef(dispatch);
      dispatchRef.current = dispatch;
      const storeRef = useRef(store);
      storeRef.current = store;
      const locationRef = useRef(location);
      locationRef.current = location;

      const handleEvent = (event, hasPayload) => {
            const section = normalizeSection(event?.section ?? event?.type);
            if (!section) return;

            const currentDispatch = dispatchRef.current;
            const getState = storeRef.current.getState;
            const version = resolveVersion(event, Date.now());

            invalidateSectionHttpCache(section);
            recordServerVersion(section, version);

            if (hasPayload) {
                  currentDispatch(updatePublicData({ type: section, data: event.data, version }));
            } else {
                  currentDispatch(externalSectionUpdated({ section, version }));
            }

            if (section === "projects") {
                  currentDispatch(markPublicProjectsUpdated());

                  const currentSlug = getState().project?.currentProject?.slug;
                  const pathname = locationRef.current?.pathname || "";
                  if (currentSlug && pathname.includes(currentSlug)) {
                        currentDispatch(getProjectBySlugThunk(currentSlug));
                  }
            }

            const recentlyMutated =
                  Date.now() - getLocalMutationAt(section) < LOCAL_MUTATION_GRACE_MS;
            if (recentlyMutated) return;

            const loader = ADMIN_LOADERS[section];
            if (loader && loader.hasData(getState())) {
                  loader.actions().forEach((action) => currentDispatch(action));
            }
      };

      useSocket("portfolioUpdated", (payload) => {
            handleEvent(payload, true);
      });

      useEffect(
            () =>
                  subscribeSectionUpdates((message) => {
                        handleEvent(message, false);
                  }),
            [],
      );
};

export default usePortfolioSync;
