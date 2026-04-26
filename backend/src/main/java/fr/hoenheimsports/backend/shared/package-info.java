/**
 * This module provides shared infrastructure for the entire application.
 * It includes global security configurations, common exception handling,
 * caching policies, and cross-cutting utility components.
 * This module is configured as an OPEN module to allow all other modules
 * to access its shared components.
 */
@NullMarked
@ApplicationModule(
        type = ApplicationModule.Type.OPEN
)
package fr.hoenheimsports.backend.shared;

import org.jspecify.annotations.NullMarked;
import org.springframework.modulith.ApplicationModule;
