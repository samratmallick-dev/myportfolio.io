import { useLazySection } from "./useLazySection";

/**
 * Route-level data loading helper.
 * Use `priority` for data required to render the route immediately
 * (hero on the homepage, contact details on the contact page).
 */
export const usePublicSectionData = (section, options = {}) =>
      useLazySection(section, options);

export default usePublicSectionData;
