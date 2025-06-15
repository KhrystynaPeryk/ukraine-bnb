'use client'

import { useEffect, useState } from "react";
import { useCurrentUser } from "../hooks/useCurrentUser.ts";
import EmptyState from "../components/EmptyState";
import ReservationsClient from "./ReservationsClient";
import Loader from "../components/Loader";
import { ReservationWithListing } from "../trips/TripsClient";

const ReservationsPage = () => {
    const { currentUser, loading: userLoading } = useCurrentUser();
    const [reservations, setReservations] = useState<ReservationWithListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReservations = async () => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // Use authorId to get reservations on properties you own
            const response = await fetch(`/api/reservations?authorId=${currentUser.id}`);

            if (response.ok) {
                const data = await response.json();
                setReservations(data);
                setError(null);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to fetch reservations');
            }
        } catch (error) {
            console.error('Error fetching reservations:', error);
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!userLoading) {
            fetchReservations();
        }
    }, [currentUser, userLoading]);

    if (userLoading || loading) {
        return <Loader />;
    }

    if (!currentUser) {
        return (
            <EmptyState title="Unauthorized" subtitle="Please login" />
        );
    }

    if (error) {
        return (
            <EmptyState title="Error" subtitle={error} />
        );
    }

    if (reservations.length === 0) {
        return (
            <EmptyState title="No reservations found" subtitle="Looks like you have no reservations on your properties" />
        );
    }

    return (
        <ReservationsClient 
            reservations={reservations}
            onReservationChange={fetchReservations} // Pass refresh function
        />
    );
};

export default ReservationsPage;