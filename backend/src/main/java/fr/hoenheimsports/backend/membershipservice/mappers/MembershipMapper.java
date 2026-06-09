package fr.hoenheimsports.backend.membershipservice.mappers;

import fr.hoenheimsports.backend.membershipservice.dtos.MembershipPaymentResponse;
import fr.hoenheimsports.backend.membershipservice.dtos.MembershipResponse;
import fr.hoenheimsports.backend.membershipservice.dtos.PaymentPayerResponse;
import fr.hoenheimsports.backend.membershipservice.dtos.PaymentResponse;
import fr.hoenheimsports.backend.membershipservice.entities.Membership;
import fr.hoenheimsports.backend.membershipservice.entities.PaymentPayerInfo;
import fr.hoenheimsports.backend.membershipservice.entities.PaymentTransaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * MapStruct mapper for Membership and PaymentTransaction related entities and DTOs.
 */
@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface MembershipMapper {

    /**
     * Maps a Membership entity to a MembershipResponse DTO.
     *
     * @param membership the membership entity to map
     * @return the mapped MembershipResponse DTO
     */
    @Mapping(source = "email.value", target = "email")
    @Mapping(source = "licenseNumber.value", target = "licenseNumber")
    @Mapping(source = "category.name", target = "categoryName")
    @Mapping(source = "category.price.amount", target = "amount")
    MembershipResponse mapToResponse(Membership membership);

    /**
     * Maps a list of Membership entities to a list of MembershipResponse DTOs.
     *
     * @param memberships the list of membership entities
     * @return the mapped list of MembershipResponse DTOs
     */
    List<MembershipResponse> mapToResponseList(List<Membership> memberships);

    /**
     * Maps a PaymentTransaction entity to a MembershipPaymentResponse DTO.
     *
     * @param paymentTransaction the payment transaction to map
     * @return the mapped MembershipPaymentResponse DTO
     */
    @Mapping(source = "id", target = "paymentTransactionId")
    @Mapping(source = "sumupCheckout", target = "sumupCheckout")
    @Mapping(source = "memberships", target = "memberships")
    MembershipPaymentResponse mapToResponse(PaymentTransaction paymentTransaction);

    /**
     * Maps a PaymentTransaction entity to a PaymentResponse DTO.
     *
     * @param paymentTransaction the payment transaction to map
     * @return the mapped PaymentResponse DTO
     */
    @Mapping(source = "payerInfo", target = "payerInfo")
    @Mapping(source = "sumupCheckout.date", target = "checkoutDate")
    @Mapping(source = "amount.amount", target = "amount")
    @Mapping(source = "memberships", target = "memberships")
    @Mapping(source = "discounted", target = "isDiscounted")
    PaymentResponse mapToPaymentResponse(PaymentTransaction paymentTransaction);

    /**
     * Maps a PaymentPayerInfo entity to a PaymentPayerResponse DTO.
     *
     * @param payerInfo the payment payer info to map
     * @return the mapped PaymentPayerResponse DTO
     */
    PaymentPayerResponse mapToPaymentPayerResponse(PaymentPayerInfo payerInfo);
}
