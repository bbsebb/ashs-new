package fr.hoenheimsports.backend.membershipservice.mappers;

import fr.hoenheimsports.backend.membershipservice.dtos.CampaignResponse;
import fr.hoenheimsports.backend.membershipservice.dtos.CategoryDto;
import fr.hoenheimsports.backend.membershipservice.entities.Campaign;
import fr.hoenheimsports.backend.membershipservice.entities.Category;
import fr.hoenheimsports.backend.membershipservice.entities.Price;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

import java.math.BigDecimal;
import java.util.Set;

/**
 * MapStruct mapper for Campaign-related entities and DTOs.
 */
@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface CampaignMapper {

    /**
     * Maps a Campaign entity to a CampaignResponse DTO.
     *
     * @param campaign the campaign to map
     * @return the mapped CampaignResponse
     */
    CampaignResponse toResponse(Campaign campaign);

    /**
     * Maps a Category entity to a CategoryDto.
     *
     * @param category the category entity to map
     * @return the mapped CategoryDto
     */
    @Mapping(source = "price.amount", target = "amount")
    CategoryDto toCategoryDto(Category category);

    /**
     * Maps a set of Category entities to a set of CategoryDtos.
     *
     * @param categories the set of categories
     * @return the mapped set of CategoryDtos
     */
    Set<CategoryDto> toCategoryDtoSet(Set<Category> categories);

    /**
     * Maps a CategoryDto to a Category entity.
     *
     * @param categoryDto the category DTO to map
     * @return the mapped Category entity
     */
    @Mapping(source = "amount", target = "price")
    Category toCategory(CategoryDto categoryDto);

    /**
     * Maps a set of CategoryDtos to a set of Category entities.
     *
     * @param categoryDtos the set of category DTOs
     * @return the mapped set of Category entities
     */
    Set<Category> toCategorySet(Set<CategoryDto> categoryDtos);

    /**
     * Helper mapping method for converting BigDecimal to Price value object.
     *
     * @param amount the BigDecimal amount
     * @return the Price value object
     */
    default Price mapBigDecimalToPrice(BigDecimal amount) {
        return Price.of(amount);
    }

    /**
     * Helper mapping method for converting Price value object to BigDecimal.
     *
     * @param price the Price value object
     * @return the BigDecimal amount
     */
    default BigDecimal mapPriceToBigDecimal(Price price) {
        return price.amount();
    }
}
